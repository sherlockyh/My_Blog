import type { ReactNode } from 'react';
import {
  AppstoreOutlined,
  BlockOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useSiteStore } from '../../store/site';
import { pick } from '../../utils/content';

const ICONS: Record<string, ReactNode> = {
  thunder: <ThunderboltOutlined />,
  box: <AppstoreOutlined />,
  layers: <BlockOutlined />,
  team: <TeamOutlined />,
};

export default function FeatureCards() {
  const features = useSiteStore((s) => s.site?.config.features) || [];

  return (
    <section className="container feature-grid">
      {features.map((f, i) => (
        <div className="card feature-card" key={i}>
          <div className="feature-icon">{ICONS[f.icon] ?? <ThunderboltOutlined />}</div>
          <div>
            <h3>{pick(f.titleZh, f.titleEn)}</h3>
            <p>{pick(f.descZh, f.descEn)}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
