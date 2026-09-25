import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import type { AppConfig } from './common/config/config.validation';

/** 组装 CSP：图片源放行对象存储公网地址，连接源跟随 CORS_ORIGIN（补 ws/wss 变体）。 */
function buildCsp(s3PublicOrigin: string, connectSources: string[]) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: https: ${s3PublicOrigin}`,
    "font-src 'self' data:",
    `connect-src ${connectSources.join(' ')}`,
  ].join('; ');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const config = app.get<ConfigService<AppConfig>>(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  app.useBodyParser('json', { limit: '32kb' });

  // CORS_ORIGIN 支持逗号分隔多个前端来源；开发环境默认放行 vite dev server。
  const corsOrigins = (
    config.get<string>('CORS_ORIGIN') || (isProduction ? '' : 'http://localhost:5173')
  )
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const wsOrigins = corsOrigins.map((o) => o.replace(/^http/, 'ws'));
  // 上传图片走浏览器直连 MinIO，img-src 必须放行其公开地址（格式已在 config.validation 校验）。
  const s3PublicOrigin = new URL(
    config.get<string>('S3_PUBLIC_BASE_URL') || 'http://localhost:9000',
  ).origin;
  const csp = buildCsp(s3PublicOrigin, ["'self'", ...corsOrigins, ...wsOrigins]);

  expressApp.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.setGlobalPrefix('api');
  app.enableCors({
    // 生产环境必须由 CORS_ORIGIN 明确放行；开发环境未配置时放开便于本地联调。
    origin: corsOrigins.length ? corsOrigins : isProduction ? [] : true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(config.get<string>('PORT') || 7001);
  await app.listen(port);
  console.log(`[server] listening on http://localhost:${port}`);
}
bootstrap();
