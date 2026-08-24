import type { MessageDTO, Paged } from '@my-blog/shared';
import { request } from './http';
import type { PageQuery } from './api-types';

export const messageApi = {
  messages: () => request.get<MessageDTO[]>('/messages'),
  postMessage: (body: { nickname: string; content: string }) => request.post<MessageDTO>('/messages', body),
};

export const adminMessageApi = {
  adminMessages: (params?: PageQuery) => request.get<Paged<MessageDTO>>('/admin/messages', { params }),
  deleteMessage: (id: number) => request.delete<{ ok: boolean }>(`/admin/messages/${id}`),
};
