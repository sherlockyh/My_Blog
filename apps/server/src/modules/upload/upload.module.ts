import { Module } from '@nestjs/common';
import { UploadController } from './controllers/upload.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class UploadModule {}
