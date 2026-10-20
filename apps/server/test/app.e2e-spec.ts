import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuditService } from '../src/common/audit/audit.service';
import { JwtGuard } from '../src/common/guards/jwt.guard';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { RedisService } from '../src/common/redis/redis.service';
import { StorageService } from '../src/modules/upload/storage.service';

/**
 * e2e 冒烟：验证应用能完整启动（全局管道/拦截器/守卫/过滤器接线正确）、
 * 路由可达、响应包络符合约定。外部依赖以 mock 替换，CI 无需真实 DB/Redis。
 */
describe('App (e2e)', () => {
  let app: INestApplication;
  const auditLog = jest.fn();
  const projectRow = {
    id: 7,
    titleZh: '项目详情测试',
    titleEn: '',
    descZh: '卡片简介',
    descEn: '',
    contentZh: '## 核心功能\n支持项目详情',
    contentEn: '',
    cover: '',
    tags: ['React'],
    link: 'https://example.com',
    featured: true,
    sort: 0,
    createdAt: new Date().toISOString(),
  };
  const findProjects = jest.fn(async ({ select }: { select: Record<string, boolean> }) => [
    Object.fromEntries(Object.entries(projectRow).filter(([key]) => select[key])),
  ]);

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
        project: {
          findMany: findProjects,
          count: async () => 1,
          findUnique: async ({ where }: { where: { id: number } }) =>
            where.id === 7 ? projectRow : null,
          update: async ({ data }: { data: Record<string, unknown> }) => ({
            ...projectRow,
            ...data,
          }),
          create: async ({ data }: { data: Record<string, unknown> }) => ({
            id: 7,
            ...data,
          }),
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
      .overrideProvider(StorageService)
      .useValue({ check: async () => undefined })
      .overrideProvider(AuditService)
      .useValue({ log: auditLog })
      // 审计断言路由在 JwtGuard 之后，测试中直接放行
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
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

  it('审计拦截器记录业务原始返回值而非响应包络（守护拦截器注册顺序）', async () => {
    auditLog.mockClear();
    const res = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .send({ titleZh: '审计断言项目' })
      .expect(201);
    // 响应侧是包络
    expect(res.body).toMatchObject({ code: 0, data: { id: 7, titleZh: '审计断言项目' } });
    // 审计侧必须看到 handler 原始返回值：detail 从 result.titleZh 取到业务字段。
    // 若 AuditInterceptor 被注册到 TransformInterceptor 外层，这里会拿到包络
    // 导致 titleZh 丢失，用例即失败。
    expect(auditLog).toHaveBeenCalledTimes(1);
    const arg = auditLog.mock.calls[0][0];
    expect(arg.action).toBe('project.create');
    expect(arg.targetId).toBe(7);
    expect(arg.detail).toMatchObject({ titleZh: '审计断言项目' });
    expect(arg.detail).not.toHaveProperty('code');
  });

  it('公开项目列表与后台分页不携带正文，后台仍保留 items/total 契约', async () => {
    const publicRes = await request(app.getHttpServer()).get('/api/projects').expect(200);
    expect(publicRes.body.data[0]).toMatchObject({ id: 7, descZh: '卡片简介' });
    expect(publicRes.body.data[0]).not.toHaveProperty('contentZh');
    expect(publicRes.body.data[0]).not.toHaveProperty('contentEn');
    const adminRes = await request(app.getHttpServer()).get('/api/admin/projects').expect(200);
    expect(adminRes.body.data).toMatchObject({ total: 1, page: 1 });
    expect(adminRes.body.data.items[0]).not.toHaveProperty('contentZh');
    expect(
      findProjects.mock.calls.every(
        ([query]) => !query.select.contentZh && !query.select.contentEn,
      ),
    ).toBe(true);
  });

  it.each(['/api/projects/7', '/api/admin/projects/7'])('%s 返回完整正文', async (url) => {
    const res = await request(app.getHttpServer()).get(url).expect(200);
    expect(res.body.data).toMatchObject({ id: 7, contentZh: projectRow.contentZh, contentEn: '' });
  });

  it.each(['/api/projects/9999', '/api/admin/projects/9999'])('%s 不存在返回 404', async (url) => {
    const res = await request(app.getHttpServer()).get(url).expect(404);
    expect(res.body).toMatchObject({ code: 404, data: null });
  });

  it('详情参数必须是整数', async () => {
    await request(app.getHttpServer()).get('/api/projects/invalid').expect(400);
  });

  it('创建与修改支持双语正文，并允许清空正文及访问地址', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .send({ titleZh: '项目', contentZh: '## 中文', contentEn: '## English', link: '' })
      .expect(201);
    expect(created.body.data).toMatchObject({
      contentZh: '## 中文',
      contentEn: '## English',
      link: '',
    });
    const updated = await request(app.getHttpServer())
      .put('/api/admin/projects/7')
      .send({ contentZh: '', contentEn: '', link: '' })
      .expect(200);
    expect(updated.body.data).toMatchObject({ contentZh: '', contentEn: '', link: '' });
  });

  it.each(['javascript:alert(1)', 'data:text/html,test', 'ftp://example.com', 'example.com'])(
    '拒绝不安全或不完整地址 %s',
    async (link) => {
      await request(app.getHttpServer())
        .post('/api/admin/projects')
        .send({ titleZh: '项目', link })
        .expect(400);
      await request(app.getHttpServer()).put('/api/admin/projects/7').send({ link }).expect(400);
    },
  );

  it.each(['https://example.com/demo', 'http://localhost:5173'])(
    '接受完整访问地址 %s',
    async (link) => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/projects')
        .send({ titleZh: '项目', link: ` ${link} ` })
        .expect(201);
      expect(res.body.data.link).toBe(link);
    },
  );

  it('拒绝超过约定长度或类型错误的正文', async () => {
    await request(app.getHttpServer())
      .put('/api/admin/projects/7')
      .send({ contentZh: 'a'.repeat(50001) })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/admin/projects')
      .send({ titleZh: '项目', contentEn: 123 })
      .expect(400);
  });
});
