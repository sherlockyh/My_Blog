import { request } from './http';

export const uploadApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request.post<{ url: string }>('/admin/upload', form);
  },
};
