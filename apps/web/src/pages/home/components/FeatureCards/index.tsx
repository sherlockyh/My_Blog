// 组件用途：展示首页特色能力入口卡片。
import type { ReactNode } from 'react';
import {
  AppstoreOutlined,
  CodeOutlined,
  ReadOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useSiteStore } from '@/store/site';
import { pick } from '@/utils/content';
import './styles/index.module.less';

const ICONS: Record<string, ReactNode> = {
  thunder: <ThunderboltOutlined />,
  box: <AppstoreOutlined />,
  layers: <ReadOutlined />,
  team: <TeamOutlined />,
};

const FALLBACK_FEATURES = [
  { icon: 'thunder', titleZh: '高效开发', titleEn: 'Efficient Dev', descZh: '专注于现代化前端技术栈，打造高性能的 Web 应用', descEn: 'Building high-performance web apps with modern frontend stacks.' },
  { icon: 'box', titleZh: '用户体验', titleEn: 'User Experience', descZh: '注重细节与交互设计，让产品更易用、更舒服', descEn: 'Designing thoughtful interactions and polished product details.' },
  { icon: 'layers', titleZh: '持续学习', titleEn: 'Keep Learning', descZh: '保持好奇心，探索新技术，不断提升技术边界', descEn: 'Exploring new ideas and expanding technical boundaries.' },
  { icon: 'team', titleZh: '分享交流', titleEn: 'Share Ideas', descZh: '乐于分享知识与经验，期待与志同道合的你交流', descEn: 'Sharing notes, experience and ideas with fellow builders.' },
];

const EXTRA_ICONS: Record<string, ReactNode> = {
  code: <CodeOutlined />,
  react: <ThunderboltOutlined />,
  ts: <span>TS</span>,
  node: <span>Node</span>,
  idea: <ReadOutlined />,
  tool: <ToolOutlined />,
};

export default function FeatureCards() {
  const configured = useSiteStore((s) => s.site?.config.features) || [];
  const configuredRows = configured.slice(0, 4);
  const hasConfiguredDesc = configuredRows.every((item) => pick(item.descZh, item.descEn));
  const features = configuredRows.length >= 4 && hasConfiguredDesc ? configuredRows : FALLBACK_FEATURES;

  return (
    <section className="container feature-grid">
      {features.map((f, i) => (
        <div className="card feature-card" key={i}>
          <div className="feature-icon">{EXTRA_ICONS[f.icon] ?? ICONS[f.icon] ?? <ThunderboltOutlined />}</div>
          <div>
            <h3>{pick(f.titleZh, f.titleEn)}</h3>
            {pick(f.descZh, f.descEn) && <p>{pick(f.descZh, f.descEn)}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}
