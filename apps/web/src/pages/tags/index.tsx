// 页面用途：展示公开文章标签云。
import { useEffect, useState } from 'react';
import { TagOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { articleApi } from '@/services/article';
import './styles/index.module.less';

export default function Tags() {
  const { t } = useTranslation();
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    articleApi.articleTags().then(setTags).catch(() => setTags([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container section blog-module">
      <div className="page-heading">
        <h1>{t('tags.title')}</h1>
        <p>{t('tags.subtitle')}</p>
      </div>
      <Spin spinning={loading}>
        {!loading && !tags.length && <Empty description={t('tags.empty')} />}
        <div className="tag-cloud card">
          {tags.map((tag, index) => (
            <Link
              key={tag}
              to={`/articles?tag=${encodeURIComponent(tag)}`}
              className="tag-cloud-item"
              style={{ ['--tag-scale' as string]: String(1 + Math.min(index, 8) * 0.04) }}
            >
              <TagOutlined /> {tag}
            </Link>
          ))}
        </div>
      </Spin>
    </div>
  );
}
