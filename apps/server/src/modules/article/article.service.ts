import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus } from '@my-blog/shared';
import { Prisma } from '@prisma/client';
import { CACHE_KEYS, CACHE_TTL } from '../../common/redis/cache-keys';
import { RedisService } from '../../common/redis/redis.service';
import { rethrowPrismaError } from '../../common/errors/prisma-error.mapper';
import { getPageParams } from '../../common/utils/pagination';
import { ViewCountService } from '../view-count/view-count.service';
import {
  AdminArticleQueryDto,
  ArticleQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/article.dto';
import { toArticleDetailDto, toArticleListDtos } from './mappers/article.mapper';
import { ArticleRepository } from './repositories/article.repository';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articles: ArticleRepository,
    private readonly redis: RedisService,
    private readonly views: ViewCountService,
  ) {}

  /** 公开列表：仅已发布，合并 Redis 实时浏览量，不返回正文 */
  async listPublic(query: ArticleQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const where: Prisma.ArticleWhereInput = { status: ArticleStatus.PUBLISHED };
    if (query.tag) where.tags = { has: query.tag };
    if (query.keyword) {
      where.OR = [
        { titleZh: { contains: query.keyword } },
        { titleEn: { contains: query.keyword, mode: 'insensitive' } },
        { summaryZh: { contains: query.keyword } },
      ];
    }
    if (query.cursor) {
      const filteredWhere = { ...where };
      const cursor = this.decodeCursor(query.cursor);
      const cursorWhere = {
        OR: [
          { publishedAt: { lt: cursor.publishedAt } },
          { publishedAt: cursor.publishedAt, id: { lt: cursor.id } },
        ],
      };
      let pageWhere: Prisma.ArticleWhereInput = { ...where, ...cursorWhere };
      if (where.OR) {
        const { OR, ...restWhere } = where;
        pageWhere = { ...restWhere, AND: [{ OR }, cursorWhere] };
      }
      const [rows, total] = await Promise.all([
        this.articles.findPublicCursorPage(pageWhere, pageSize + 1),
        this.articles.count(filteredWhere),
      ]);
      const pageRows = rows.slice(0, pageSize);
      const map = await this.views.getViewsMap(pageRows.map((r) => r.id));
      const items = toArticleListDtos(pageRows, map);
      const last = pageRows.at(-1);
      return {
        items,
        total,
        page,
        pageSize,
        nextCursor: rows.length > pageSize && last ? this.encodeCursor(last) : undefined,
      };
    }
    const [rows, total] = await Promise.all([
      this.articles.findPublicPage(where, skip, take),
      this.articles.count(where),
    ]);
    const map = await this.views.getViewsMap(rows.map((r) => r.id));
    const items = toArticleListDtos(rows, map);
    const last = rows.at(-1);
    return {
      items,
      total,
      page,
      pageSize,
      nextCursor: total > page * pageSize && last ? this.encodeCursor(last) : undefined,
    };
  }

  /** 公开详情：记录浏览量 */
  async findBySlug(slug: string, ip: string) {
    const article = await this.articles.findBySlug(slug);
    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Article not found');
    }
    const viewCount = await this.views.recordView(article.id, ip);
    return toArticleDetailDto(article, viewCount);
  }

  async allTags() {
    const cached = await this.redis.cacheGetJson<string[]>(CACHE_KEYS.articleTags);
    if (cached) return cached;

    const rows = await this.articles.findPublishedTags();
    const tags = [...new Set(rows.flatMap((r) => r.tags))];
    await this.redis.cacheSetJson(CACHE_KEYS.articleTags, tags, CACHE_TTL.articleTags);
    return tags;
  }

  /**
   * 全量公开文章精简清单（不含正文）：归档页、分类页、详情页侧栏树的共同数据源，
   * 替代前端 pageSize:50 全量拉取——那是文章超过 50 篇后会静默丢数据的临时方案。
   */
  async listAllPublished() {
    const rows = await this.articles.findAllPublished();
    const map = await this.views.getViewsMap(rows.map((r) => r.id));
    return { items: toArticleListDtos(rows, map) };
  }

  /** 后台列表：数据会持续增长，保持服务端分页，避免管理页一次性拉取正文大字段。 */
  async adminList(query: AdminArticleQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const where: Prisma.ArticleWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.tag) where.tags = { has: query.tag };
    if (query.keyword) {
      where.OR = [
        { titleZh: { contains: query.keyword } },
        { titleEn: { contains: query.keyword, mode: 'insensitive' } },
        { summaryZh: { contains: query.keyword } },
      ];
    }
    const [rows, total] = await Promise.all([
      this.articles.findAdminPage(where, skip, take),
      this.articles.count(where),
    ]);
    const map = await this.views.getViewsMap(rows.map((r) => r.id));
    const items = toArticleListDtos(rows, map);
    return { items, total, page, pageSize };
  }

  async findAdminById(id: number) {
    const article = await this.articles.findById(id);
    if (!article) throw new NotFoundException('Article not found');
    const viewCount = await this.views.getViews(id);
    return toArticleDetailDto(article, viewCount);
  }

  async create(dto: CreateArticleDto) {
    const fallbackTitle = dto.titleEn || dto.titleZh;
    let slugInput = dto.slug;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const slug = await this.uniqueSlug(slugInput, fallbackTitle);
      try {
        const article = await this.articles.create(
          dto,
          slug,
          dto.status === ArticleStatus.PUBLISHED ? new Date() : null,
        );
        await this.clearArticleCaches();
        return article;
      } catch (err) {
        if (!this.isSlugUniqueError(err) || attempt === 2) throw err;
        slugInput = `${slug}-${attempt + 2}`;
      }
    }
    throw new Error('Failed to create article');
  }

  async update(id: number, dto: UpdateArticleDto) {
    const existing = await this.articles.findById(id);
    if (!existing) throw new NotFoundException('Article not found');

    const fallbackTitle = dto.titleEn || dto.titleZh || existing.titleEn || existing.titleZh;
    const toPublished =
      dto.status === ArticleStatus.PUBLISHED && existing.status !== ArticleStatus.PUBLISHED;
    let slugInput = dto.slug;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      let slug = existing.slug;
      if (slugInput && slugInput !== existing.slug) {
        slug = await this.uniqueSlug(slugInput, fallbackTitle, id);
      }
      try {
        const article = await this.articles.update(
          id,
          dto,
          slug,
          toPublished
            ? new Date()
            : dto.status === ArticleStatus.DRAFT
              ? null
              : existing.publishedAt,
        );
        await this.clearArticleCaches();
        return article;
      } catch (err) {
        if (!this.isSlugUniqueError(err) || attempt === 2) throw err;
        slugInput = `${slug}-${attempt + 2}`;
      }
    }
    throw new Error('Failed to update article');
  }

  async remove(id: number) {
    try {
      await this.articles.delete(id);
      await this.clearArticleCaches();
      return { ok: true };
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Article not found' });
    }
  }

  private async clearArticleCaches() {
    await this.redis.cacheDel(CACHE_KEYS.articleTags);
  }

  private async uniqueSlug(input: string | undefined, fallbackTitle: string, excludeId?: number) {
    const base = this.slugify(input || fallbackTitle) || `post-${Date.now()}`;
    let slug = base;
    let i = 2;

    while (true) {
      const found = await this.articles.findBySlug(slug);
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

  private isSlugUniqueError(err: unknown) {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
  }

  private encodeCursor(row: { id: number; publishedAt: Date | null }) {
    if (!row.publishedAt) return undefined;
    return Buffer.from(`${row.publishedAt.toISOString()}|${row.id}`).toString('base64url');
  }

  private decodeCursor(cursor: string) {
    try {
      const [dateText, idText] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
      const publishedAt = new Date(dateText);
      const id = Number(idText);
      if (!Number.isInteger(id) || Number.isNaN(publishedAt.getTime()))
        throw new Error('Invalid cursor');
      return { publishedAt, id };
    } catch {
      throw new BadRequestException('Invalid cursor');
    }
  }
}
