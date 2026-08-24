import { create } from 'zustand';
import type { SiteDTO } from '@my-blog/shared';
import { siteApi } from '@/services/site';

interface SiteState {
  site: SiteDTO | null;
  load: (force?: boolean) => Promise<SiteDTO | null>;
  refresh: () => Promise<void>;
}

export const useSiteStore = create<SiteState>((set, get) => ({
  site: null,
  load: async (force = false) => {
    if (!force && get().site) return get().site;
    try {
      const site = await siteApi.site();
      set({ site });
      return site;
    } catch {
      return null;
    }
  },
  refresh: async () => {
    await get().load(true);
  },
}));
