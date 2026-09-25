import type { ArticleDTO, Paged } from '@my-blog/shared';
import { request } from './http';
import type { AdminArticleQuery, ArticleInput, ArticleQuery } from './api-types';

export const articleApi = {
  articles: (params?: ArticleQuery) => request.get<Paged<ArticleDTO>>('/articles', { params }),
  article: (slug: string) => request.get<ArticleDTO>(`/articles/${slug}`),
  articleTags: () => request.get<string[]>('/articles/tags'),
  /** 全量公开文章精简清单（无正文）：归档/分类/详情侧栏树的派生数据源 */
  allPublished: () => request.get<Paged<ArticleDTO>>('/articles/all'),
};

export const adminArticleApi = {
  adminArticles: (params?: AdminArticleQuery) =>
    request.get<Paged<ArticleDTO>>('/admin/articles', { params }),
  adminArticle: (id: number) => request.get<ArticleDTO>(`/admin/articles/${id}`),
  createArticle: (body: ArticleInput) => request.post<ArticleDTO>('/admin/articles', body),
  updateArticle: (id: number, body: ArticleInput) =>
    request.put<ArticleDTO>(`/admin/articles/${id}`, body),
  deleteArticle: (id: number) => request.delete<{ ok: boolean }>(`/admin/articles/${id}`),
};
