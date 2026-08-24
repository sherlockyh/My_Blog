import { Module } from '@nestjs/common';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { UploadController } from './controllers/upload.controller';
import { StorageService } from './services/storage.service';

@Module({
  controllers: [UploadController],
  providers: [StorageService, RateLimitGuard],
})
export class UploadModule {}
