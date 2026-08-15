import { Module } from '@nestjs/common';
import { ResourceAdminController, ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';

@Module({
  controllers: [ResourceController, ResourceAdminController],
  providers: [ResourceService],
})
export class ResourceModule {}
