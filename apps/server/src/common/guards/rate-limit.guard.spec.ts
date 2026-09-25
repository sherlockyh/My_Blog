import { HttpException } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  function setup(
    options: { ttl: number; limit: number; name?: string } | undefined,
    ip = '1.2.3.4',
  ) {
    const reflector = { getAllAndOverride: jest.fn(() => options) };
    const redis = {
      client: {
        incr: jest.fn(),
        expire: jest.fn(),
      },
    };
    const guard = new RateLimitGuard(reflector as never, redis as never);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ ip, method: 'POST', path: '/api/x', headers: {} }),
      }),
    };
    return { guard, redis, context };
  }

  it('无 @RateLimit 装饰器的路由直接放行，不触碰 Redis', async () => {
    const { guard, redis, context } = setup(undefined);
    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(redis.client.incr).not.toHaveBeenCalled();
  });

  it('窗口内首次请求设置过期时间并放行', async () => {
    const { guard, redis, context } = setup({ ttl: 60, limit: 5, name: 'login' });
    redis.client.incr.mockResolvedValue(1);
    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(redis.client.incr).toHaveBeenCalledWith('rate:login:1.2.3.4');
    expect(redis.client.expire).toHaveBeenCalledWith('rate:login:1.2.3.4', 60);
  });

  it('计数超过阈值时抛出 429', async () => {
    const { guard, redis, context } = setup({ ttl: 60, limit: 5, name: 'login' });
    redis.client.incr.mockResolvedValue(6);
    await expect(guard.canActivate(context as never)).rejects.toThrow(HttpException);
    await expect(guard.canActivate(context as never)).rejects.toMatchObject({
      status: 429,
    });
    // 超限后不应再刷新窗口
    expect(redis.client.expire).not.toHaveBeenCalled();
  });

  it('Redis 异常时向上抛出（限流链路 fail closed）', async () => {
    const { guard, redis, context } = setup({ ttl: 60, limit: 5, name: 'login' });
    redis.client.incr.mockRejectedValue(new Error('redis down'));
    await expect(guard.canActivate(context as never)).rejects.toThrow('redis down');
  });
});
