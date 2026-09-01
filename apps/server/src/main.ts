import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:5173 http://localhost:7001 ws://localhost:5173",
].join('; ');

async function bootstrap() {
  mkdirSync('uploads', { recursive: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  app.useBodyParser('json', { limit: '32kb' });
  expressApp.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
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
