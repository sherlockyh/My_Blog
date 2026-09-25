import { ViewCountService } from './view-count.service';
import type { PrismaService } from '../../common/prisma/prisma.service';
import type { RedisService } from '../../common/redis/redis.service';

describe('ViewCountService', () => {
  let service: ViewCountService;
  let prisma: {
    article: { findMany: jest.Mock; findUnique: jest.Mock; updateMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let redis: {
    client: Record<string, jest.Mock>;
  };

  function makePipeline() {
    return {
      set: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
  }

  beforeEach(() => {
    prisma = {
      article: { findMany: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    redis = {
      client: {
        set: jest.fn(),
        get: jest.fn(),
        mget: jest.fn(),
        incr: jest.fn(),
        expire: jest.fn(),
        sadd: jest.fn(),
        srandmember: jest.fn(),
        eval: jest.fn(),
        pipeline: jest.fn(makePipeline),
      },
    };
    service = new ViewCountService(
      prisma as unknown as PrismaService,
      redis as unknown as RedisService,
    );
  });

  describe('recordView', () => {
    it('同 IP 首次访问：初始化基值、计数并写入脏集合', async () => {
      redis.client.set.mockImplementation(async (key: string) =>
        key.startsWith('dedup:') ? 'OK' : null,
      );
      redis.client.mget.mockResolvedValue([null]);
      prisma.article.findMany.mockResolvedValue([{ id: 1, viewCount: 41 }]);
      redis.client.get.mockResolvedValue('42');

      await expect(service.recordView(1, '1.1.1.1')).resolves.toBe(42);
      expect(redis.client.incr).toHaveBeenCalledWith('counter:article:1');
      expect(redis.client.sadd).toHaveBeenCalledWith('dirty:article_views', '1');
    });

    it('60s 内重复访问不重复计数', async () => {
      redis.client.set.mockResolvedValue(null); // dedup NX 未抢到
      redis.client.mget.mockResolvedValue(['7']); // counter 已存在，无需回源
      redis.client.get.mockResolvedValue('7');
      await expect(service.recordView(1, '1.1.1.1')).resolves.toBe(7);
      expect(redis.client.incr).not.toHaveBeenCalled();
    });

    it('Redis 异常时降级返回 DB 持久化值', async () => {
      redis.client.set.mockRejectedValue(new Error('redis down'));
      prisma.article.findUnique.mockResolvedValue({ viewCount: 15 });
      await expect(service.recordView(1, '1.1.1.1')).resolves.toBe(15);
    });
  });

  describe('flushToDb', () => {
    it('未拿到分布式锁时直接返回，不触刷库', async () => {
      redis.client.set.mockResolvedValue(null);
      await service.flushToDb();
      expect(redis.client.srandmember).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('正常路径：快照回写 DB 并释放锁', async () => {
      redis.client.set.mockImplementation(async (key: string) =>
        key.startsWith('lock:') ? 'OK' : null,
      );
      redis.client.srandmember.mockResolvedValue(['1', '2']);
      redis.client.mget.mockResolvedValue(['101', '202']);
      await service.flushToDb();

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.article.updateMany).toHaveBeenCalledTimes(2);
      expect(prisma.article.updateMany.mock.calls[0][0]).toMatchObject({
        where: { id: 1 },
        data: { viewCount: 101 },
      });
      // 释放锁脚本至少被调用一次（release lock）
      expect(redis.client.eval).toHaveBeenCalled();
    });

    it('刷库中途抛错也要释放锁（finally）', async () => {
      redis.client.set.mockImplementation(async (key: string) =>
        key.startsWith('lock:') ? 'OK' : null,
      );
      redis.client.srandmember.mockResolvedValue(['1']);
      redis.client.mget.mockResolvedValue(['5']);
      prisma.$transaction.mockRejectedValue(new Error('db down'));
      await expect(service.flushToDb()).rejects.toThrow('db down');
      expect(redis.client.eval).toHaveBeenCalled();
    });

    it('空值/非法计数不参与回写', async () => {
      redis.client.set.mockImplementation(async (key: string) =>
        key.startsWith('lock:') ? 'OK' : null,
      );
      redis.client.srandmember.mockResolvedValue(['1', 'abc', '3']);
      redis.client.mget.mockResolvedValue(['10', null, '-1']);
      await service.flushToDb();
      expect(prisma.article.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.article.updateMany.mock.calls[0][0]).toMatchObject({
        where: { id: 1 },
        data: { viewCount: 10 },
      });
    });
  });

  describe('totalViews', () => {
    it('汇总全部文章的实时浏览量', async () => {
      prisma.article.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      redis.client.mget.mockResolvedValue([null, null]);
      prisma.article.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]); // ensure 回源
      const pipeline = makePipeline();
      redis.client.pipeline.mockReturnValue(pipeline);
      pipeline.exec.mockResolvedValue([
        [null, '3'],
        [null, '4'],
      ]);
      await expect(service.totalViews()).resolves.toBe(7);
    });
  });
});
