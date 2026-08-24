import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';
import { RATE_LIMIT_KEY, RateLimitOptions } from './rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!options) return true;

    const req = context.switchToHttp().getRequest();
    const key = this.buildKey(options, req);
    // 限流属于防护链路，Redis 异常会向上抛出，让高风险接口 fail closed。
    const count = await this.redis.client.incr(key);
    // 首次命中时设置过期时间，形成固定窗口限流；实现简单，足够覆盖登录/留言/上传这类低频接口。
    if (count === 1) await this.redis.client.expire(key, options.ttl);
    if (count > options.limit) {
      throw new HttpException('请求过于频繁，请稍后再试', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }

  private buildKey(options: RateLimitOptions, req: any) {
    const routeKey = options.name || `${req.method}:${req.route?.path || req.path}`;
    // main.ts 已开启 trust proxy；反向代理部署时 req.ip 会尽量使用真实客户端 IP。
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    return `rate:${routeKey}:${ip}`;
  }
}
