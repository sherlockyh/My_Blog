import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { AppConfig } from '../../common/config/config.validation';
import { LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  /** 启动时播种管理员账号（单管理员） */
  async onModuleInit() {
    const count = await this.prisma.user.count();
    if (count > 0) return;
    const username = this.config.get<string>('ADMIN_USERNAME') || 'admin';
    const password = this.config.get<string>('ADMIN_PASSWORD') || 'admin123';
    if (
      this.config.get<string>('NODE_ENV') === 'production' &&
      (!this.config.get<string>('ADMIN_USERNAME') || !this.config.get<string>('ADMIN_PASSWORD'))
    ) {
      throw new Error('生产环境首次启动必须配置 ADMIN_USERNAME 和 ADMIN_PASSWORD');
    }
    await this.prisma.user.create({
      data: { username, passwordHash: await bcrypt.hash(password, 10) },
    });
    this.logger.log(`Seeded admin user: ${username}`);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const token = await this.jwt.signAsync({ sub: user.id, username: user.username });
    return { token };
  }
}
