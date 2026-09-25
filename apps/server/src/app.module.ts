import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { validateConfig } from './common/config/config.validation';
import { AuditInterceptor } from './common/audit/audit.interceptor';
import { AuditModule } from './common/audit/audit.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/article/article.module';
import { ProjectModule } from './modules/project/project.module';
import { ResourceModule } from './modules/resource/resource.module';
import { MessageModule } from './modules/message/message.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';
import { UploadModule } from './modules/upload/upload.module';
import { ViewCountModule } from './modules/view-count/view-count.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuditModule,
    ViewCountModule,
    HealthModule,
    AuthModule,
    ArticleModule,
    ProjectModule,
    ResourceModule,
    MessageModule,
    SiteConfigModule,
    UploadModule,
  ],
  providers: [
    // 先注册的拦截器在洋葱外层。TransformInterceptor 须在外、AuditInterceptor 在内，
    // 审计的 tap 才能记录 handler 的原始返回值而非响应包络（有 e2e 断言守护）
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    // 限流守卫全局注册，无 @RateLimit 装饰器的路由直接放行
    { provide: APP_GUARD, useClass: RateLimitGuard },
  ],
})
export class AppModule {}
