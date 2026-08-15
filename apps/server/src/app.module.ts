import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './common/prisma.module';
import { RedisModule } from './common/redis.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { TransformInterceptor } from './common/transform.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/article/article.module';
import { ProjectModule } from './modules/project/project.module';
import { ResourceModule } from './modules/resource/resource.module';
import { MessageModule } from './modules/message/message.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';
import { UploadModule } from './modules/upload/upload.module';
import { ViewCountModule } from './modules/view-count/view-count.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    RedisModule,
    ViewCountModule,
    AuthModule,
    ArticleModule,
    ProjectModule,
    ResourceModule,
    MessageModule,
    SiteConfigModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
