import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RedisService } from '../src/common/redis/redis.service';

/**
 * e2e 冒烟：验证应用能完整启动（全局管道/拦截器/守卫/过滤器接线正确）、
 * 路由可达、响应包络符合约定。外部依赖以 mock 替换，CI 无需真实 DB/Redis。
 */
describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        // health/ready 的探活 + auth 的用户查询；count=1 跳过管理员播种
        $queryRaw: async () => [],
        user: {
          count: async () => 1,
          findUnique: async () => null,
          create: async () => ({}),
        },
      })
      .overrideProvider(RedisService)
      .useValue({
        client: {
          ping: async () => 'PONG',
          // 限流守卫走固定窗口计数
          incr: async () => 1,
          expire: async () => 1,
          // view-count 退出刷库会触到的命令
          set: async () => null,
          srandmember: async () => [],
          eval: async () => 1,
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    // 镜像 main.ts 的全局管道注册，保证 e2e 与真实应用行为一致
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health/live 不依赖外部服务，返回 ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/health/live').expect(200);
    // 成功包络的 code 约定为 0（HTTP 状态码仍为 200）
    expect(res.body).toMatchObject({ code: 0, data: { ok: true } });
  });

  it('/api/health/ready 探活依赖后返回 ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/health/ready').expect(200);
    expect(res.body).toMatchObject({ code: 0, data: { ok: true } });
  });

  it('未知路由返回统一 404 包络', async () => {
    const res = await request(app.getHttpServer()).get('/api/no-such-route').expect(404);
    expect(res.body).toMatchObject({ code: 404, data: null });
    expect(typeof res.body.message).toBe('string');
  });

  it('/api/auth/login 凭证错误返回 401 包络', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'ghost', password: 'wrong' })
      .expect(401);
    expect(res.body).toMatchObject({ code: 401, data: null });
  });

  it('/api/auth/login 缺字段被全局校验管道拒绝', async () => {
    await request(app.getHttpServer()).post('/api/auth/login').send({}).expect(400);
  });
});
