import { Injectable } from '@nestjs/common';
import { FeatureItem, HeroConfig, ProfileDTO, SiteConfigDTO, SiteDTO, StatsDTO } from '@my-blog/shared';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { ViewCountService } from '../view-count/view-count.service';
import { UpdateProfileDto, UpdateSiteConfigDto } from './site-config.dto';

const CACHE_KEY = 'cache:site';

const DEFAULT_HERO: HeroConfig = {
  greeting: 'Hi, 我是 yh',
  titleZh: '用代码创造有趣的数字体验',
  titleEn: 'Creating fun digital experiences with code',
  descZh: '热爱前端开发与产品设计，喜欢把复杂的想法变成简洁、美观且好用的 Web 应用。',
  descEn: 'Passionate about frontend development and product design, turning complex ideas into simple, beautiful and usable web apps.',
};

const DEFAULT_FEATURES: FeatureItem[] = [
  { icon: 'thunder', titleZh: '高效开发', titleEn: 'Efficiency', descZh: '专注工程化和性能体验，打造高质量 Web 应用', descEn: 'Focused on engineering and performance for high-quality web apps' },
  { icon: 'box', titleZh: '用户体验', titleEn: 'UX', descZh: '注重细节与交互设计，让产品更清晰、更好用', descEn: 'Attention to detail and interaction design for clearer, friendlier products' },
  { icon: 'layers', titleZh: '持续学习', titleEn: 'Learning', descZh: '保持好奇，探索新技术，不断提升技术边界', descEn: 'Stay curious, explore new tech, keep pushing the boundary' },
  { icon: 'team', titleZh: '分享交流', titleEn: 'Sharing', descZh: '乐于分享知识，与志同道合的伙伴交流', descEn: 'Love sharing knowledge with like-minded peers' },
];

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
    private readonly redis: RedisService,
    private readonly views: ViewCountService,
  ) {}

  /** 公开接口：站点配置 + 个人信息，Redis 缓存 10 分钟 */
  async getSite(): Promise<SiteDTO> {
    const cached = await this.redis.client.get(CACHE_KEY);
    if (cached) return JSON.parse(cached) as SiteDTO;

    const [configRow, profileRow] = await Promise.all([
      this.prisma.siteConfig.findUnique({ where: { id: 1 } }),
      this.prisma.profile.findUnique({ where: { id: 1 } }),
    ]);

    const site: SiteDTO = {
      config: {
        hero: { ...DEFAULT_HERO, ...((configRow?.hero as any) ?? {}) },
        features: (configRow?.features as unknown as FeatureItem[]) ?? DEFAULT_FEATURES,
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
    await this.redis.client.set(CACHE_KEY, JSON.stringify(site), 'EX', 600);
    return site;
  }

  async updateConfig(dto: UpdateSiteConfigDto): Promise<SiteConfigDTO> {
    const current = (await this.getSite()).config;
    const next: SiteConfigDTO = {
      hero: { ...current.hero, ...dto.hero },
      features: dto.features?.length ? (dto.features as FeatureItem[]) : current.features,
      weatherCity: dto.weatherCity ?? current.weatherCity,
      announcement: dto.announcement ?? current.announcement,
    };
    await this.prisma.siteConfig.upsert({
      where: { id: 1 },
      create: { id: 1, hero: next.hero as any, features: next.features as any, weatherCity: next.weatherCity, announcement: next.announcement },
      update: { hero: next.hero as any, features: next.features as any, weatherCity: next.weatherCity, announcement: next.announcement },
    });
    await this.redis.client.del(CACHE_KEY);
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
    await this.redis.client.del(CACHE_KEY);
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
