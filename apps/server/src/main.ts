import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  mkdirSync('uploads', { recursive: true });
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = Number(process.env.PORT || 7001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
}
bootstrap();
