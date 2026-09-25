import { Module } from '@nestjs/common';
import { ProjectAdminController, ProjectController } from './controllers/project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController, ProjectAdminController],
  providers: [ProjectService],
})
export class ProjectModule {}
