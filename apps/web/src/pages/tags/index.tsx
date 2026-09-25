// 页面用途：展示公开文章标签云。

import { TagOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Button, Empty, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { articleApi } from '@/services/article';
import { useRequest } from '@/hooks/useRequest';
import './styles/index.less';

export default function Tags() {
  const { t } = useTranslation();
  const { data, loading, error, refresh } = useRequest(() => articleApi.articleTags());
  const tags = data ?? [];

  return (
    <div className="container section blog-module">
      <div className="page-heading">
        <h1>{t('tags.title')}</h1>
        <p>{t('tags.subtitle')}</p>
      </div>
      <Spin spinning={loading}>
        {error ? (
          <Empty description={t('common.loadFailed')}>
            <Button onClick={() => void refresh()}>{t('common.retry')}</Button>
          </Empty>
        ) : (
          !loading && !tags.length && <Empty description={t('tags.empty')} />
        )}
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
