import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../common/prisma/prisma.module';
import type { AppConfig } from '../../common/config/config.validation';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => {
        const fallback = 'my-blog-jwt-secret';
        const secret = config.get('JWT_SECRET') || fallback;
        if (config.get('NODE_ENV') === 'production' && secret === fallback) {
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
  providers: [AuthService],
})
export class AuthModule {}
