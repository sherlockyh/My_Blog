import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';

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
  private readonly flushBatchSize = 200;

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
    const pipeline = this.redis.client.pipeline();
    ids.forEach((id) => pipeline.exists(this.key(id)));
    const res = await pipeline.exec();
    const missing: number[] = [];
    res?.forEach((r, i) => {
      if (!(r[1] as number)) missing.push(ids[i]);
    });
    if (!missing.length) return;
    const rows = await this.prisma.article.findMany({
      where: { id: { in: missing } },
      select: { id: true, viewCount: true },
    });
    const p2 = this.redis.client.pipeline();
    rows.forEach((r) => p2.set(this.key(r.id), String(r.viewCount)));
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
    const ids = (await this.redis.client.srandmember(this.dirtySetKey, this.flushBatchSize))
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
    if (!ids.length) return;

    const keys = ids.map((id) => this.key(id));
    const values = await this.redis.client.mget(keys);
    const updates = ids
      .map((id, i) => ({ id, count: Number(values[i] ?? 0) }))
      .filter((x) => Number.isFinite(x.id) && Number.isFinite(x.count));
    if (!updates.length) return;
    await this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.article.updateMany({ where: { id: u.id }, data: { viewCount: u.count } }),
      ),
    );
    // DB 写入成功后再移除 dirty id；如果前面失败，集合保留，下一轮定时任务继续补刷。
    await this.redis.client.srem(this.dirtySetKey, ...updates.map((u) => String(u.id)));
    this.logger.log(`Flushed ${updates.length} article view counters to DB`);
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
    await this.flushToDb();
  }

  async onModuleDestroy() {
    await this.flushToDb();
  }
}
