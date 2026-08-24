import type { StatsDTO } from '@my-blog/shared';
import { request } from './http';

export const dashboardApi = {
  stats: () => request.get<StatsDTO>('/admin/stats'),
};
