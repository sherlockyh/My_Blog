import { Module } from '@nestjs/common';
import { ProjectAdminController, ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController, ProjectAdminController],
  providers: [ProjectService],
})
export class ProjectModule {}
