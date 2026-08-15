import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';

/**
 * 文章浏览量计数：Redis 为实时源，DB viewCount 为持久化基值。
 * - counter:article:{id} 存总量，首次 miss 用 DB 值初始化
 * - dedup:article:{id}:{ip} 60s 内同 IP 不重复计数
 * - 每 5 分钟 + 进程退出时把计数器整体写回 DB
 */
@Injectable()
export class ViewCountService implements OnModuleDestroy {
  private readonly logger = new Logger(ViewCountService.name);

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
    const dedup = `dedup:article:${id}:${ip}`;
    const acquired = await this.redis.client.set(dedup, '1', 'EX', 60, 'NX');
    if (acquired) {
      await this.ensure([id]);
      await this.redis.client.incr(this.key(id));
    }
    return this.getViews(id);
  }

  async getViews(id: number): Promise<number> {
    await this.ensure([id]);
    const v = await this.redis.client.get(this.key(id));
    return Number(v ?? 0);
  }

  async getViewsMap(ids: number[]): Promise<Record<number, number>> {
    if (!ids.length) return {};
    await this.ensure(ids);
    const pipeline = this.redis.client.pipeline();
    ids.forEach((id) => pipeline.get(this.key(id)));
    const res = await pipeline.exec();
    const map: Record<number, number> = {};
    res?.forEach((r, i) => {
      map[ids[i]] = Number((r[1] as string) ?? 0);
    });
    return map;
  }

  /** 将 Redis 计数器写回 DB */
  async flushToDb() {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [next, batch] = await this.redis.client.scan(cursor, 'MATCH', 'counter:article:*', 'COUNT', 100);
      cursor = next;
      keys.push(...batch);
    } while (cursor !== '0');
    if (!keys.length) return;

    const values = await this.redis.client.mget(keys);
    const updates = keys
      .map((k, i) => ({ id: Number(k.split(':').pop()), count: Number(values[i] ?? 0) }))
      .filter((x) => Number.isFinite(x.id) && Number.isFinite(x.count));
    if (!updates.length) return;
    await this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.article.updateMany({ where: { id: u.id }, data: { viewCount: u.count } }),
      ),
    );
    this.logger.log(`Flushed ${updates.length} article view counters to DB`);
  }

  /** 全站文章总浏览量（实时） */
  async totalViews(): Promise<number> {
    const rows = await this.prisma.article.findMany({ select: { id: true } });
    const map = await this.getViewsMap(rows.map((x) => x.id));
    return Object.values(map).reduce((sum, v) => sum + v, 0);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    await this.flushToDb();
  }

  async onModuleDestroy() {
    await this.flushToDb();
  }
}
