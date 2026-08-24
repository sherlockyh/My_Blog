import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      // 控制单次请求重试次数，避免 Redis 故障时业务请求长时间挂起。
      maxRetriesPerRequest: 2,
    });
    this.client.on('error', (err) => {
      this.logger.warn(`Redis error: ${err.message}`);
    });
  }

  async cacheGetJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (err) {
      // 缓存不是事实来源：读取失败时返回 null，让调用方回源数据库。
      this.logger.warn(`Redis cache get failed: ${key}; ${(err as Error).message}`);
      return null;
    }
  }

  async cacheSetJson(key: string, value: unknown, ttlSeconds: number) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      // 写缓存失败不应影响主流程；下一次请求最多再查一次数据库。
      this.logger.warn(`Redis cache set failed: ${key}; ${(err as Error).message}`);
    }
  }

  async cacheDel(key: string) {
    try {
      await this.client.del(key);
    } catch (err) {
      // 删除缓存失败只影响短时间一致性，保留日志即可，避免后台编辑接口误报失败。
      this.logger.warn(`Redis cache delete failed: ${key}; ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    this.client.disconnect();
  }
}
