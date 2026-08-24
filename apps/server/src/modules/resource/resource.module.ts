import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { ResourceAdminController, ResourceController } from './controllers/resource.controller';
import { ResourceRepository } from './repositories/resource.repository';
import { ResourceService } from './resource.service';

@Module({
  imports: [AuditModule],
  controllers: [ResourceController, ResourceAdminController],
  providers: [ResourceRepository, ResourceService],
})
export class ResourceModule {}
