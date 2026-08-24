import type { Paged, ResourceDTO } from '@my-blog/shared';
import { request } from './http';
import type { PageQuery } from './api-types';

export const resourceApi = {
  resources: () => request.get<ResourceDTO[]>('/resources'),
};

export const adminResourceApi = {
  adminResources: (params?: PageQuery) => request.get<Paged<ResourceDTO>>('/admin/resources', { params }),
  createResource: (body: Partial<ResourceDTO>) => request.post<ResourceDTO>('/admin/resources', body),
  updateResource: (id: number, body: Partial<ResourceDTO>) => request.put<ResourceDTO>(`/admin/resources/${id}`, body),
  deleteResource: (id: number) => request.delete<{ ok: boolean }>(`/admin/resources/${id}`),
};
