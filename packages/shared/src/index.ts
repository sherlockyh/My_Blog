/** 前后端共享类型定义 */

export type Locale = 'zh' | 'en';

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface ArticleDTO {
  id: number;
  slug: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  contentZh?: string;
  contentEn?: string;
  cover: string;
  tags: string[];
  status: ArticleStatus;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
  id: number;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  cover: string;
  tags: string[];
  link: string;
  featured: boolean;
  sort: number;
  createdAt: string;
}

export interface ResourceDTO {
  id: number;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  link: string;
  category: string;
  createdAt: string;
}

export interface MessageDTO {
  id: number;
  nickname: string;
  content: string;
  createdAt: string;
}

export interface HeroConfig {
  greeting: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
}

export interface FeatureItem {
  icon: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
}

export interface SiteConfigDTO {
  hero: HeroConfig;
  features: FeatureItem[];
  weatherCity: string;
  announcement: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface ProfileDTO {
  name: string;
  avatar: string;
  bioZh: string;
  bioEn: string;
  location: string;
  socials: SocialLink[];
}

export interface SiteDTO {
  config: SiteConfigDTO;
  profile: ProfileDTO;
}

export interface StatsDTO {
  totalViews: number;
  articleCount: number;
  publishedCount: number;
  projectCount: number;
  messageCount: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
