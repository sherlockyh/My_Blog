import type { ArticleStatus, FeatureItem, HeroConfig, ProfileDTO, SocialLink } from '@my-blog/shared';

export interface ArticleQuery {
  page?: number;
  pageSize?: number;
  cursor?: string;
  tag?: string;
  keyword?: string;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
}

export interface AdminArticleQuery extends ArticleQuery {
  status?: ArticleStatus;
}

export interface ArticleInput {
  slug?: string;
  titleZh?: string;
  titleEn?: string;
  summaryZh?: string;
  summaryEn?: string;
  contentZh?: string;
  contentEn?: string;
  cover?: string;
  tags?: string[];
  status?: ArticleStatus;
}

export interface SiteConfigInput {
  hero?: Partial<HeroConfig>;
  features?: FeatureItem[];
  weatherCity?: string;
  announcement?: string;
}

export interface ProfileInput extends Partial<Omit<ProfileDTO, 'socials'>> {
  socials?: SocialLink[];
}
