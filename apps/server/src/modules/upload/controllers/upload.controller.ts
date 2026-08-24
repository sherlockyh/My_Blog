import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RateLimit } from '../../../common/guards/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { StorageService } from '../services/storage.service';

const ALLOWED_TYPES: Record<string, string[]> = {
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
};

@Controller('admin/upload')
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @RateLimit({ name: 'admin-upload', ttl: 60, limit: 20 })
  @UseGuards(RateLimitGuard, JwtGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const allowedMimes = ALLOWED_TYPES[ext];
        // 扩展名和 MIME 类型同时校验，避免明显伪装的非图片文件进入 uploads。
        if (!allowedMimes?.includes(file.mimetype)) {
          cb(new BadRequestException('Unsupported file type'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.storage.savePublicFile(file);
  }
}
