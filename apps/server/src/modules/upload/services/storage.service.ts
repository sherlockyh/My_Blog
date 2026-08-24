import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  async savePublicFile(file: Express.Multer.File) {
    await mkdir(this.uploadDir, { recursive: true });
    const ext = extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const path = join(this.uploadDir, filename);
    // 当前实现是本地存储；后续切 S3/OSS 时保持返回 URL 契约不变，替换这里即可。
    await writeFile(path, file.buffer);
    return { url: `/uploads/${filename}` };
  }
}
