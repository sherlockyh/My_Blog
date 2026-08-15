import type {
  ArticleDTO,
  MessageDTO,
  Paged,
  ProjectDTO,
  ResourceDTO,
  SiteDTO,
  StatsDTO,
} from '@my-blog/shared';
import { http } from './http';

export const api = {
  site: () => http.get<unknown, SiteDTO>('/site'),
  articles: (params?: { page?: number; pageSize?: number; tag?: string; keyword?: string }) =>
    http.get<unknown, Paged<ArticleDTO>>('/articles', { params }),
  article: (slug: string) => http.get<unknown, ArticleDTO>(`/articles/${slug}`),
  articleTags: () => http.get<unknown, string[]>('/articles/tags'),
  projects: () => http.get<unknown, ProjectDTO[]>('/projects'),
  resources: () => http.get<unknown, ResourceDTO[]>('/resources'),
  messages: () => http.get<unknown, MessageDTO[]>('/messages'),
  postMessage: (body: { nickname: string; content: string }) =>
    http.post<unknown, MessageDTO>('/messages', body),

  login: (body: { username: string; password: string }) =>
    http.post<unknown, { token: string }>('/auth/login', body),

  adminArticles: () => http.get<unknown, ArticleDTO[]>('/admin/articles'),
  createArticle: (body: Partial<ArticleDTO>) => http.post<unknown, ArticleDTO>('/admin/articles', body),
  updateArticle: (id: number, body: Partial<ArticleDTO>) =>
    http.put<unknown, ArticleDTO>(`/admin/articles/${id}`, body),
  deleteArticle: (id: number) => http.delete<unknown, { ok: boolean }>(`/admin/articles/${id}`),

  adminProjects: () => http.get<unknown, ProjectDTO[]>('/admin/projects'),
  createProject: (body: Partial<ProjectDTO>) => http.post<unknown, ProjectDTO>('/admin/projects', body),
  updateProject: (id: number, body: Partial<ProjectDTO>) =>
    http.put<unknown, ProjectDTO>(`/admin/projects/${id}`, body),
  deleteProject: (id: number) => http.delete<unknown, { ok: boolean }>(`/admin/projects/${id}`),

  adminResources: () => http.get<unknown, ResourceDTO[]>('/admin/resources'),
  createResource: (body: Partial<ResourceDTO>) => http.post<unknown, ResourceDTO>('/admin/resources', body),
  updateResource: (id: number, body: Partial<ResourceDTO>) =>
    http.put<unknown, ResourceDTO>(`/admin/resources/${id}`, body),
  deleteResource: (id: number) => http.delete<unknown, { ok: boolean }>(`/admin/resources/${id}`),

  adminMessages: () => http.get<unknown, MessageDTO[]>('/admin/messages'),
  deleteMessage: (id: number) => http.delete<unknown, { ok: boolean }>(`/admin/messages/${id}`),

  stats: () => http.get<unknown, StatsDTO>('/admin/stats'),
  updateSiteConfig: (body: Record<string, unknown>) => http.put<unknown, unknown>('/admin/site-config', body),
  updateProfile: (body: Record<string, unknown>) => http.put<unknown, unknown>('/admin/profile', body),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return http.post<unknown, { url: string }>('/admin/upload', form);
  },
};
