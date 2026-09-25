import { Prisma } from '@prisma/client';
import { ArticleStatus } from '@my-blog/shared';
import { ArticleService } from './article.service';
import type { ArticleRepository } from './repositories/article.repository';
import type { RedisService } from '../../common/redis/redis.service';
import type { ViewCountService } from '../view-count/view-count.service';
import type { CreateArticleDto } from './dto/article.dto';

const p2002 = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed on the fields: (slug)', {
    code: 'P2002',
    clientVersion: 'test',
  });

describe('ArticleService 创建/更新时的 slug 处理', () => {
  let service: ArticleService;
  let articles: { findBySlug: jest.Mock; create: jest.Mock };
  let redis: { cacheDel: jest.Mock };

  const dto = {
    titleZh: '标题',
    titleEn: 'My Post',
    status: ArticleStatus.PUBLISHED,
  } as unknown as CreateArticleDto;

  beforeEach(() => {
    articles = { findBySlug: jest.fn(), create: jest.fn() };
    redis = { cacheDel: jest.fn().mockResolvedValue(undefined) };
    service = new ArticleService(
      articles as unknown as ArticleRepository,
      redis as unknown as RedisService,
      {} as ViewCountService,
    );
  });

  it('slug 未被占用时一次创建成功', async () => {
    articles.findBySlug.mockResolvedValue(null);
    articles.create.mockResolvedValue({ id: 1, slug: 'my-post' });
    await expect(service.create(dto)).resolves.toEqual({ id: 1, slug: 'my-post' });
    expect(articles.create).toHaveBeenCalledWith(dto, 'my-post', expect.any(Date));
    // 创建成功后要清理标签缓存
    expect(redis.cacheDel).toHaveBeenCalled();
  });

  it('slug 已被占用时自动追加数字后缀', async () => {
    articles.findBySlug.mockImplementation(async (slug: string) =>
      slug === 'my-post' ? { id: 9, slug } : null,
    );
    articles.create.mockResolvedValue({ id: 2, slug: 'my-post-2' });
    await expect(service.create(dto)).resolves.toEqual({ id: 2, slug: 'my-post-2' });
    expect(articles.create).toHaveBeenCalledWith(dto, 'my-post-2', expect.any(Date));
  });

  it('并发撞唯一约束时按后缀重试并最终成功', async () => {
    articles.findBySlug.mockResolvedValue(null);
    articles.create
      .mockRejectedValueOnce(p2002())
      .mockResolvedValueOnce({ id: 3, slug: 'my-post-2' });
    await expect(service.create(dto)).resolves.toEqual({ id: 3, slug: 'my-post-2' });
    // 第二次尝试用的 slug 带上了重试后缀
    expect(articles.create).toHaveBeenLastCalledWith(dto, 'my-post-2', expect.any(Date));
  });

  it('连续三次唯一约束冲突后向上抛出原始错误', async () => {
    articles.findBySlug.mockResolvedValue(null);
    articles.create.mockRejectedValue(p2002());
    await expect(service.create(dto)).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    expect(articles.create).toHaveBeenCalledTimes(3);
    // 全部失败，不应清理缓存
    expect(redis.cacheDel).not.toHaveBeenCalled();
  });

  it('slug 清洗：非字母数字字符折叠为分隔符', async () => {
    articles.findBySlug.mockResolvedValue(null);
    articles.create.mockResolvedValue({ id: 4 });
    await service.create({ ...dto, slug: 'Hello World! 2026' } as CreateArticleDto);
    expect(articles.create).toHaveBeenCalledWith(
      expect.anything(),
      'hello-world-2026',
      expect.any(Date),
    );
  });
});
