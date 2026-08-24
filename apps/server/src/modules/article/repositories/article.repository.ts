import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';

export const ARTICLE_LIST_SELECT = {
  id: true,
  slug: true,
  titleZh: true,
  titleEn: true,
  summaryZh: true,
  summaryEn: true,
  cover: true,
  tags: true,
  status: true,
  viewCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;

export type ArticleListRow = Prisma.ArticleGetPayload<{ select: typeof ARTICLE_LIST_SELECT }>;

@Injectable()
export class ArticleRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPublicPage(where: Prisma.ArticleWhereInput, skip: number, take: number) {
    return this.prisma.article.findMany({
      where,
      select: ARTICLE_LIST_SELECT,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      skip,
      take,
    });
  }

  findPublicCursorPage(where: Prisma.ArticleWhereInput, take: number) {
    return this.prisma.article.findMany({
      where,
      select: ARTICLE_LIST_SELECT,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take,
    });
  }

  count(where: Prisma.ArticleWhereInput) {
    return this.prisma.article.count({ where });
  }

  findBySlug(slug: string) {
    return this.prisma.article.findUnique({ where: { slug } });
  }

  findById(id: number) {
    return this.prisma.article.findUnique({ where: { id } });
  }

  findPublishedTags() {
    return this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { tags: true },
    });
  }

  findAdminPage(where: Prisma.ArticleWhereInput, skip: number, take: number) {
    return this.prisma.article.findMany({
      where,
      select: ARTICLE_LIST_SELECT,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      skip,
      take,
    });
  }

  create(dto: CreateArticleDto, slug: string, publishedAt: Date | null) {
    return this.prisma.article.create({ data: { ...dto, slug, publishedAt } });
  }

  update(id: number, dto: UpdateArticleDto, slug: string, publishedAt: Date | null) {
    return this.prisma.article.update({ where: { id }, data: { ...dto, slug, publishedAt } });
  }

  delete(id: number) {
    return this.prisma.article.delete({ where: { id } });
  }
}
