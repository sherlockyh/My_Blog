import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const fallback = 'my-blog-jwt-secret';
        const secret = config.get<string>('JWT_SECRET') || fallback;
        if (process.env.NODE_ENV === 'production' && secret === fallback) {
          throw new Error('生产环境必须配置安全的 JWT_SECRET');
        }
        return {
          secret,
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RateLimitGuard],
})
export class AuthModule {}
