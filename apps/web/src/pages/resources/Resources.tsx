import { useEffect, useState } from 'react';
import { LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ResourceDTO } from '@my-blog/shared';
import { api } from '../../services/api';
import { pick } from '../../utils/content';

export default function Resources() {
  const { t } = useTranslation();
  const [resources, setResources] = useState<ResourceDTO[]>([]);

  useEffect(() => {
    api.resources().then(setResources).catch(() => {});
  }, []);

  const groups = resources.reduce<Record<string, ResourceDTO[]>>((acc, r) => {
    const key = r.category || 'Other';
    (acc[key] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="container section">
      <div className="section-header">
        <h2 className="section-title">{t('nav.resources')}</h2>
      </div>
      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className="resource-group">
          <h3 className="resource-category">{category}</h3>
          <div className="resource-grid">
            {items.map((r) => (
              <a key={r.id} className="card resource-card" href={r.link} target="_blank" rel="noreferrer">
                <h4>
                  <LinkOutlined /> {pick(r.titleZh, r.titleEn)}
                </h4>
                <p>{pick(r.descZh, r.descEn)}</p>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
