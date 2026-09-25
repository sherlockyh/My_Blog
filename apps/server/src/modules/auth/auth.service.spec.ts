import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { count: jest.Mock; findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { signAsync: jest.Mock };

  beforeEach(() => {
    prisma = { user: { count: jest.fn(), findUnique: jest.fn(), create: jest.fn() } };
    jwt = { signAsync: jest.fn() };
    const config = {
      get: jest.fn(
        (key: string) =>
          ({ NODE_ENV: 'test', ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'secret-pass' })[key],
      ),
    };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
  });

  describe('login', () => {
    it('账号密码正确时签发 token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'admin',
        passwordHash: await bcrypt.hash('secret-pass', 4),
      });
      jwt.signAsync.mockResolvedValue('token-abc');
      await expect(service.login({ username: 'admin', password: 'secret-pass' })).resolves.toEqual({
        token: 'token-abc',
      });
      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 1, username: 'admin' });
    });

    it('用户不存在时抛 401', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ username: 'ghost', password: 'x' })).rejects.toMatchObject({
        status: 401,
      });
    });

    it('密码错误时抛 401', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'admin',
        passwordHash: await bcrypt.hash('secret-pass', 4),
      });
      await expect(service.login({ username: 'admin', password: 'wrong' })).rejects.toMatchObject({
        status: 401,
      });
    });
  });

  describe('onModuleInit 管理员播种', () => {
    it('已有用户时跳过播种', async () => {
      prisma.user.count.mockResolvedValue(1);
      await service.onModuleInit();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('无用户时按配置创建管理员', async () => {
      prisma.user.count.mockResolvedValue(0);
      prisma.user.create.mockResolvedValue({});
      await service.onModuleInit();
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      const arg = prisma.user.create.mock.calls[0][0];
      expect(arg.data.username).toBe('admin');
      // 密码必须落的是哈希而非明文
      expect(arg.data.passwordHash).not.toBe('secret-pass');
    });
  });
});
