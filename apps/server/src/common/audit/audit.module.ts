import { Module } from '@nestjs/common';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';

@Module({
  providers: [AuditInterceptor, AuditService],
  exports: [AuditInterceptor, AuditService],
})
export class AuditModule {}
