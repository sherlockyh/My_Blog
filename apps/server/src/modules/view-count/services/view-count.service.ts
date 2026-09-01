import { randomUUID } from 'crypto';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';

const RELEASE_LOCK_SCRIPT = `
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
end
return 0
`;

const REMOVE_UNCHANGED_DIRTY_SCRIPT = `
local dirtySetKey = KEYS[#KEYS]
local counterCount = #KEYS - 1
for i = 1, counterCount do
  local id = ARGV[counterCount + i]
  if redis.call('get', KEYS[i]) == ARGV[i] then
    redis.call('srem', dirtySetKey, id)
  end
end
return 1
`;

/**
 * 文章浏览量计数：Redis 为实时源，DB viewCount 为持久化基值。
 * - counter:article:{id} 存总量，首次 miss 用 DB 值初始化
 * - dedup:article:{id}:{ip} 60s 内同 IP 不重复计数
 * - 每 5 分钟 + 进程退出时把计数器整体写回 DB
 */
@Injectable()
export class ViewCountService implements OnModuleDestroy {
  private readonly logger = new Logger(ViewCountService.name);
  private readonly dirtySetKey = 'dirty:article_views';
  private readonly flushLockKey = 'lock:article_views_flush';
  private readonly flushBatchSize = 200;
  private readonly flushLockTtlSeconds = 300;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private key(id: number) {
    return `counter:article:${id}`;
  }

  /** 计数器不存在时用 DB 基值初始化 */
  private async ensure(ids: number[]) {
    if (!ids.length) return;
    const values = await this.redis.client.mget(ids.map((id) => this.key(id)));
    const missing = ids.filter((_, i) => values[i] === null);
    if (!missing.length) return;
    const rows = await this.prisma.article.findMany({
      where: { id: { in: missing } },
      select: { id: true, viewCount: true },
    });
    const p2 = this.redis.client.pipeline();
    rows.forEach((r) => p2.set(this.key(r.id), String(r.viewCount), 'NX'));
    await p2.exec();
  }

  /** 记录一次浏览，返回当前浏览量 */
  async recordView(id: number, ip: string): Promise<number> {
    try {
      const dedup = `dedup:article:${id}:${ip}`;
      const acquired = await this.redis.client.set(dedup, '1', 'EX', 60, 'NX');
      if (acquired) {
        await this.ensure([id]);
        await this.redis.client.incr(this.key(id));
        // 只记录发生变化的文章，定时刷库时不用扫描所有 counter key。
        await this.redis.client.sadd(this.dirtySetKey, String(id));
      }
      return this.getViews(id);
    } catch (err) {
      // 浏览量不是文章详情的强依赖；Redis 抖动时降级返回 DB 持久化值，保证详情可访问。
      this.logger.warn(`Record view fallback to DB value: article=${id}; ${(err as Error).message}`);
      return this.getDbViews(id);
    }
  }

  async getViews(id: number): Promise<number> {
    try {
      await this.ensure([id]);
      const v = await this.redis.client.get(this.key(id));
      return Number(v ?? 0);
    } catch (err) {
      this.logger.warn(`Get view fallback to DB value: article=${id}; ${(err as Error).message}`);
      return this.getDbViews(id);
    }
  }

  async getViewsMap(ids: number[]): Promise<Record<number, number>> {
    if (!ids.length) return {};
    try {
      await this.ensure(ids);
      const pipeline = this.redis.client.pipeline();
      ids.forEach((id) => pipeline.get(this.key(id)));
      const res = await pipeline.exec();
      const map: Record<number, number> = {};
      res?.forEach((r, i) => {
        map[ids[i]] = Number((r[1] as string) ?? 0);
      });
      return map;
    } catch (err) {
      this.logger.warn(`Get view map fallback to DB values; ${(err as Error).message}`);
      return this.getDbViewsMap(ids);
    }
  }

  /** 将 Redis 计数器写回 DB */
  async flushToDb() {
    const lockToken = randomUUID();
    const acquired = await this.redis.client.set(
      this.flushLockKey,
      lockToken,
      'EX',
      this.flushLockTtlSeconds,
      'NX',
    );
    if (!acquired) return;

    try {
      const ids = (await this.redis.client.srandmember(this.dirtySetKey, this.flushBatchSize))
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0);
      if (!ids.length) return;

      const keys = ids.map((id) => this.key(id));
      const values = await this.redis.client.mget(keys);
      const updates = ids
        .map((id, i) => ({ id, count: Number(values[i]), expected: values[i] }))
        .filter(
          (x): x is { id: number; count: number; expected: string } =>
            x.expected !== null && Number.isSafeInteger(x.count) && x.count >= 0,
        );
      if (!updates.length) return;

      await this.prisma.$transaction(
        updates.map((u) =>
          this.prisma.article.updateMany({ where: { id: u.id }, data: { viewCount: u.count } }),
        ),
      );

      // 只有 Redis 仍是本次快照时才清理 dirty，回写期间的新浏览量会保留标记等待下一轮。
      await this.redis.client.eval(
        REMOVE_UNCHANGED_DIRTY_SCRIPT,
        updates.length + 1,
        ...updates.map((u) => this.key(u.id)),
        this.dirtySetKey,
        ...updates.map((u) => u.expected),
        ...updates.map((u) => String(u.id)),
      );
      this.logger.log(`Flushed ${updates.length} article view counters to DB`);
    } finally {
      try {
        await this.redis.client.eval(RELEASE_LOCK_SCRIPT, 1, this.flushLockKey, lockToken);
      } catch (err) {
        this.logger.warn(`Release view flush lock failed: ${(err as Error).message}`);
      }
    }
  }

  /** 全站文章总浏览量（实时） */
  async totalViews(): Promise<number> {
    const rows = await this.prisma.article.findMany({ select: { id: true } });
    const map = await this.getViewsMap(rows.map((x) => x.id));
    return Object.values(map).reduce((sum, v) => sum + v, 0);
  }

  private async getDbViews(id: number): Promise<number> {
    const row = await this.prisma.article.findUnique({
      where: { id },
      select: { viewCount: true },
    });
    return row?.viewCount ?? 0;
  }

  private async getDbViewsMap(ids: number[]): Promise<Record<number, number>> {
    const rows = await this.prisma.article.findMany({
      where: { id: { in: ids } },
      select: { id: true, viewCount: true },
    });
    return rows.reduce<Record<number, number>>((map, row) => {
      map[row.id] = row.viewCount;
      return map;
    }, {});
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    try {
      await this.flushToDb();
    } catch (err) {
      this.logger.error(`Flush article view counters failed: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.flushToDb();
    } catch (err) {
      this.logger.error(`Flush article view counters on shutdown failed: ${(err as Error).message}`);
    }
  }
}
