import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  getJson<T>(key: string) {
    return this.redis.cacheGetJson<T>(key);
  }

  setJson(key: string, value: unknown, ttlSeconds: number) {
    return this.redis.cacheSetJson(key, value, ttlSeconds);
  }

  del(key: string) {
    return this.redis.cacheDel(key);
  }
}
