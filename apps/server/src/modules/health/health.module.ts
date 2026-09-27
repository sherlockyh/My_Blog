import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [HealthController],
})
export class HealthModule {}
