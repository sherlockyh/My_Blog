import type { Paged, ProjectDTO } from '@my-blog/shared';
import { request } from './http';
import type { PageQuery } from './api-types';

export const projectApi = {
  projects: () => request.get<ProjectDTO[]>('/projects'),
};

export const adminProjectApi = {
  adminProjects: (params?: PageQuery) => request.get<Paged<ProjectDTO>>('/admin/projects', { params }),
  createProject: (body: Partial<ProjectDTO>) => request.post<ProjectDTO>('/admin/projects', body),
  updateProject: (id: number, body: Partial<ProjectDTO>) => request.put<ProjectDTO>(`/admin/projects/${id}`, body),
  deleteProject: (id: number) => request.delete<{ ok: boolean }>(`/admin/projects/${id}`),
};
