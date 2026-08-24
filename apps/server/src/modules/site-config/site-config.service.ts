import { Injectable } from '@nestjs/common';
import { FeatureItem, HeroConfig, ProfileDTO, SiteConfigDTO, SiteDTO, StatsDTO } from '@my-blog/shared';
import { CACHE_KEYS, CACHE_TTL } from '../../common/cache/cache-keys';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ViewCountService } from '../view-count/services/view-count.service';
import { UpdateProfileDto, UpdateSiteConfigDto } from './dto/site-config.dto';

const DEFAULT_HERO: HeroConfig = {
  greeting: 'Hi, 我是 yh',
  titleZh: '用代码创造有趣的数字体验',
  titleEn: 'Creating fun digital experiences with code',
  descZh: '热爱前端开发与产品设计，喜欢把复杂的想法变成简洁、美观且好用的 Web 应用。',
  descEn: 'Passionate about frontend development and product design, turning complex ideas into simple, beautiful and usable web apps.',
};

const DEFAULT_FEATURES: FeatureItem[] = [
  { icon: 'code', titleZh: '前端开发', titleEn: 'Frontend', descZh: '', descEn: '' },
  { icon: 'react', titleZh: 'React', titleEn: 'React', descZh: '', descEn: '' },
  { icon: 'ts', titleZh: 'TypeScript', titleEn: 'TypeScript', descZh: '', descEn: '' },
  { icon: 'node', titleZh: 'Node.js', titleEn: 'Node.js', descZh: '', descEn: '' },
  { icon: 'idea', titleZh: '设计灵感', titleEn: 'Ideas', descZh: '', descEn: '' },
  { icon: 'tool', titleZh: '工具推荐', titleEn: 'Tools', descZh: '', descEn: '' },
];

function normalizeFeatures(features?: FeatureItem[]) {
  // 兼容旧配置的 4 个特色项：按设计稿固定补齐 6 个入口，避免前台出现空白技能卡。
  return DEFAULT_FEATURES.map((fallback, index) => ({ ...fallback, ...(features?.[index] ?? {}) }));
}

const DEFAULT_PROFILE: ProfileDTO = {
  name: 'yh',
  avatar: '/images/avatar.svg',
  bioZh: '前端开发工程师，热爱技术与设计，喜欢用代码解决问题，创造价值。',
  bioEn: 'Frontend engineer who loves tech and design, solving problems with code.',
  location: '浙江，杭州',
  socials: [],
};

@Injectable()
export class SiteConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly views: ViewCountService,
  ) {}

  /** 公开接口：站点配置 + 个人信息，Redis 缓存 10 分钟 */
  async getSite(): Promise<SiteDTO> {
    const cached = await this.cache.getJson<SiteDTO>(CACHE_KEYS.site);
    if (cached) return cached;

    const [configRow, profileRow] = await Promise.all([
      this.prisma.siteConfig.findUnique({ where: { id: 1 } }),
      this.prisma.profile.findUnique({ where: { id: 1 } }),
    ]);

    const site: SiteDTO = {
      config: {
        hero: { ...DEFAULT_HERO, ...((configRow?.hero as any) ?? {}) },
        features: normalizeFeatures(configRow?.features as unknown as FeatureItem[] | undefined),
        weatherCity: configRow?.weatherCity ?? 'Hangzhou',
        announcement: configRow?.announcement ?? '',
      },
      profile: profileRow
        ? {
            name: profileRow.name || DEFAULT_PROFILE.name,
            avatar: profileRow.avatar || DEFAULT_PROFILE.avatar,
            bioZh: profileRow.bioZh || DEFAULT_PROFILE.bioZh,
            bioEn: profileRow.bioEn || DEFAULT_PROFILE.bioEn,
            location: profileRow.location || DEFAULT_PROFILE.location,
            socials: (profileRow.socials as any) ?? [],
          }
        : DEFAULT_PROFILE,
    };
    await this.cache.setJson(CACHE_KEYS.site, site, CACHE_TTL.site);
    return site;
  }

  async updateConfig(dto: UpdateSiteConfigDto): Promise<SiteConfigDTO> {
    const current = (await this.getSite()).config;
    const next: SiteConfigDTO = {
      hero: { ...current.hero, ...dto.hero },
      features: dto.features?.length ? normalizeFeatures(dto.features as FeatureItem[]) : current.features,
      weatherCity: dto.weatherCity ?? current.weatherCity,
      announcement: dto.announcement ?? current.announcement,
    };
    await this.prisma.siteConfig.upsert({
      where: { id: 1 },
      create: { id: 1, hero: next.hero as any, features: next.features as any, weatherCity: next.weatherCity, announcement: next.announcement },
      update: { hero: next.hero as any, features: next.features as any, weatherCity: next.weatherCity, announcement: next.announcement },
    });
    await this.cache.del(CACHE_KEYS.site);
    return next;
  }

  async updateProfile(dto: UpdateProfileDto): Promise<ProfileDTO> {
    const current = (await this.getSite()).profile;
    const next: ProfileDTO = { ...current, ...dto, socials: dto.socials ?? current.socials };
    await this.prisma.profile.upsert({
      where: { id: 1 },
      create: { id: 1, name: next.name, avatar: next.avatar, bioZh: next.bioZh, bioEn: next.bioEn, location: next.location, socials: next.socials as any },
      update: { name: next.name, avatar: next.avatar, bioZh: next.bioZh, bioEn: next.bioEn, location: next.location, socials: next.socials as any },
    });
    await this.cache.del(CACHE_KEYS.site);
    return next;
  }

  async stats(): Promise<StatsDTO> {
    const [totalViews, articleCount, publishedCount, projectCount, messageCount] = await Promise.all([
      this.views.totalViews(),
      this.prisma.article.count(),
      this.prisma.article.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.project.count(),
      this.prisma.message.count(),
    ]);
    return { totalViews, articleCount, publishedCount, projectCount, messageCount };
  }
}
