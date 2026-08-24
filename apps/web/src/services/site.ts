import type { SiteDTO } from '@my-blog/shared';
import { request } from './http';
import type { ProfileInput, SiteConfigInput } from './api-types';

export const siteApi = {
  site: () => request.get<SiteDTO>('/site'),
  updateSiteConfig: (body: SiteConfigInput) => request.put<unknown>('/admin/site-config', body),
  updateProfile: (body: ProfileInput) => request.put<unknown>('/admin/profile', body),
};
