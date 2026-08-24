import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { ProjectAdminController, ProjectController } from './controllers/project.controller';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectService } from './project.service';

@Module({
  imports: [AuditModule],
  controllers: [ProjectController, ProjectAdminController],
  providers: [ProjectRepository, ProjectService],
})
export class ProjectModule {}
