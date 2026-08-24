import type { Article } from '@prisma/client';
import type { ArticleListRow } from '../repositories/article.repository';

export function withViewCount<T extends { id: number; viewCount: number }>(row: T, views: Record<number, number>) {
  return { ...row, viewCount: views[row.id] ?? row.viewCount };
}

export function toArticleListDtos(rows: ArticleListRow[], views: Record<number, number>) {
  return rows.map((row) => withViewCount(row, views));
}

export function toArticleDetailDto(row: Article, viewCount: number) {
  return { ...row, viewCount };
}
