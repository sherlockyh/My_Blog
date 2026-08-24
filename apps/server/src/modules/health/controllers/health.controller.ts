import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    return this.ready();
  }

  @Get('live')
  live() {
    // liveness 不访问外部依赖，避免 DB/Redis 短暂抖动导致容器被错误重启。
    return { ok: true };
  }

  @Get('ready')
  async ready() {
    // readiness 检查真实依赖；失败时让负载均衡停止转发，而不是静默降级。
    await this.prisma.$queryRaw`SELECT 1`;
    await this.redis.client.ping();
    return { ok: true };
  }
}
