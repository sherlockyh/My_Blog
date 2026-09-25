import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const UPLOAD_KEY_PREFIX = 'uploads/';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private ensureBucketPromise: Promise<void> | null = null;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'my-blog';
    this.publicBaseUrl = (process.env.S3_PUBLIC_BASE_URL || 'http://localhost:9000').replace(
      /\/+$/,
      '',
    );
    this.client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      // MinIO 自建服务必须用路径风格寻址（http://endpoint/{bucket}/{key}），虚拟主机风格会解析到错误域名。
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    try {
      await this.ensureBucket();
    } catch (error) {
      // MinIO 未就绪不阻塞应用启动，首次上传时会重试初始化。
      this.logger.warn(
        `MinIO 桶初始化失败，将在首次上传时重试: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private ensureBucket(): Promise<void> {
    // 缓存初始化 Promise 防止并发请求重复建桶；失败时清缓存允许重试。
    if (!this.ensureBucketPromise) {
      this.ensureBucketPromise = this.initBucket().catch((error) => {
        this.ensureBucketPromise = null;
        throw error;
      });
    }
    return this.ensureBucketPromise;
  }

  private async initBucket() {
    const exists = await this.client
      .send(new HeadBucketCommand({ Bucket: this.bucket }))
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
    // 只放开 uploads/* 前缀的匿名读，桶内其他前缀对象保持私有。
    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicReadUploads',
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/${UPLOAD_KEY_PREFIX}*`],
            },
          ],
        }),
      }),
    );
  }

  async savePublicFile(file: Express.Multer.File) {
    await this.ensureBucket();
    const ext = extname(file.originalname).toLowerCase();
    // 不使用原始文件名，避免目录穿越、同名覆盖和文件名隐私泄露。
    const key = `${UPLOAD_KEY_PREFIX}${Date.now()}-${randomUUID()}${ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    // 返回浏览器直连 MinIO 的完整 URL，前端原样存库渲染；换域名/IP 时需要迁移存量数据。
    return { url: `${this.publicBaseUrl}/${this.bucket}/${key}` };
  }
}
