import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface AuditUser {
  sub?: number;
  username?: string;
}

interface AuditInput {
  user?: AuditUser;
  action: string;
  targetType: string;
  targetId?: string | number;
  detail?: Prisma.InputJsonValue;
  ip?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditInput) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.user?.sub,
          username: input.user?.username ?? '',
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId === undefined ? '' : String(input.targetId),
          detail: input.detail,
          ip: input.ip ?? '',
        },
      });
    } catch (err) {
      // 审计日志不能反向阻断后台主操作；失败时保留服务端告警即可。
      this.logger.warn(`Audit log failed: ${(err as Error).message}`);
    }
  }
}
