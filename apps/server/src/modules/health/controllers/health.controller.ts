import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';
import { StorageService } from '../../upload/storage.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  async check() {
    return this.ready();
  }

  @Get('live')
  live() {
    // liveness 不访问外部依赖，避免 DB/Redis/MinIO 短暂抖动导致容器被错误重启。
    return { ok: true };
  }

  @Get('ready')
  async ready() {
    const checks = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.client.ping(),
      this.storage.check(),
    ]);
    const failed = checks.find((check) => check.status === 'rejected');

    if (failed) {
      // readiness 失败时停止流量转发，但不让 liveness 误判为进程死亡。
      throw new ServiceUnavailableException('数据库、Redis 或对象存储尚未就绪');
    }

    return { ok: true };
  }
}
