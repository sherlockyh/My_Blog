export const CACHE_TTL = {
  site: 600,
  articleTags: 600,
} as const;

export const CACHE_KEYS = {
  site: 'cache:site',
  articleTags: 'cache:article:tags',
} as const;
