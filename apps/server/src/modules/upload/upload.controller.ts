import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from '../../common/jwt.guard';

const ALLOWED = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

@UseGuards(JwtGuard)
@Controller('admin/upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => {
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.includes(extname(file.originalname).toLowerCase())) {
          cb(new BadRequestException('Unsupported file type'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/${file.filename}` };
  }
}
