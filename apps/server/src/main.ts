import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  mkdirSync('uploads', { recursive: true });
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.setGlobalPrefix('api');
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((x) => x.trim()).filter(Boolean);
  app.enableCors({
    // 开发环境默认放开，生产环境通过 CORS_ORIGIN 明确允许的前端域名。
    origin: corsOrigins?.length ? corsOrigins : process.env.NODE_ENV === 'production' ? [] : true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT || 7001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
}
bootstrap();
