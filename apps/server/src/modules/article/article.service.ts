import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus } from '@my-blog/shared';
import { PrismaService } from '../../common/prisma.service';
import { ViewCountService } from '../view-count/view-count.service';
import { ArticleQueryDto, CreateArticleDto, UpdateArticleDto } from './article.dto';

@Injectable()
export class ArticleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly views: ViewCountService,
  ) {}

  /** 公开列表：仅已发布，合并 Redis 实时浏览量，不返回正文 */
  async listPublic(query: ArticleQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 10));
    const where: any = { status: ArticleStatus.PUBLISHED };
    if (query.tag) where.tags = { has: query.tag };
    if (query.keyword) {
      where.OR = [
        { titleZh: { contains: query.keyword } },
        { titleEn: { contains: query.keyword, mode: 'insensitive' } },
        { summaryZh: { contains: query.keyword } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.article.count({ where }),
    ]);
    const map = await this.views.getViewsMap(rows.map((r) => r.id));
    const items = rows.map(({ contentZh, contentEn, ...rest }) => ({
      ...rest,
      viewCount: map[rest.id] ?? rest.viewCount,
    }));
    return { items, total, page, pageSize };
  }

  /** 公开详情：记录浏览量 */
  async findBySlug(slug: string, ip: string) {
    const article = await this.prisma.article.findUnique({ where: { slug } });
    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Article not found');
    }
    const viewCount = await this.views.recordView(article.id, ip);
    return { ...article, viewCount };
  }

  async allTags() {
    const rows = await this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: { tags: true },
    });
    return [...new Set(rows.flatMap((r) => r.tags))];
  }

  /** 后台列表：含草稿 */
  async adminList() {
    const rows = await this.prisma.article.findMany({ orderBy: { updatedAt: 'desc' } });
    const map = await this.views.getViewsMap(rows.map((r) => r.id));
    return rows.map((r) => ({ ...r, viewCount: map[r.id] ?? r.viewCount }));
  }

  async create(dto: CreateArticleDto) {
    const slug = await this.uniqueSlug(dto.slug, dto.titleEn || dto.titleZh);
    return this.prisma.article.create({
      data: {
        ...dto,
        slug,
        publishedAt: dto.status === ArticleStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  async update(id: number, dto: UpdateArticleDto) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Article not found');

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      slug = await this.uniqueSlug(dto.slug, dto.titleEn || dto.titleZh || existing.titleEn || existing.titleZh, id);
    }
    const toPublished = dto.status === ArticleStatus.PUBLISHED && existing.status !== ArticleStatus.PUBLISHED;
    return this.prisma.article.update({
      where: { id },
      data: {
        ...dto,
        slug,
        publishedAt: toPublished ? new Date() : dto.status === ArticleStatus.DRAFT ? null : existing.publishedAt,
      },
    });
  }

  async remove(id: number) {
    await this.prisma.article.delete({ where: { id } });
    return { ok: true };
  }

  private async uniqueSlug(input: string | undefined, fallbackTitle: string, excludeId?: number) {
    const base = this.slugify(input || fallbackTitle) || `post-${Date.now()}`;
    let slug = base;
    let i = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const found = await this.prisma.article.findUnique({ where: { slug } });
      if (!found || found.id === excludeId) return slug;
      slug = `${base}-${i++}`;
    }
  }

  private slugify(text: string) {
    const s = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return s || '';
  }
}
