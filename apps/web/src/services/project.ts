import type { Paged, ProjectDTO, ProjectDetailDTO } from '@my-blog/shared';
import { request } from './http';
import type { PageQuery } from './api-types';

export const projectApi = {
  projects: () => request.get<ProjectDTO[]>('/projects'),
  project: (id: number) => request.get<ProjectDetailDTO>(`/projects/${id}`),
};

export const adminProjectApi = {
  adminProjects: (params?: PageQuery) =>
    request.get<Paged<ProjectDTO>>('/admin/projects', { params }),
  adminProject: (id: number) => request.get<ProjectDetailDTO>(`/admin/projects/${id}`),
  createProject: (body: Partial<ProjectDetailDTO>) =>
    request.post<ProjectDetailDTO>('/admin/projects', body),
  updateProject: (id: number, body: Partial<ProjectDetailDTO>) =>
    request.put<ProjectDetailDTO>(`/admin/projects/${id}`, body),
  deleteProject: (id: number) => request.delete<{ ok: boolean }>(`/admin/projects/${id}`),
};
