// 组件用途：展示后台最近文章列表。
import { Card } from 'antd';
import { FileTextOutlined, RightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ArticleStatus, type ArticleDTO } from '@my-blog/shared';

interface DashboardRecentArticlesProps {
  articles: ArticleDTO[];
}

export default function DashboardRecentArticles({ articles }: DashboardRecentArticlesProps) {
  const { t } = useTranslation();

  return (
    <Card className="admin-panel">
      <div className="admin-panel-title admin-panel-title-between">
        <span><FileTextOutlined /></span>
        <h2>{t('admin.recentArticles')}</h2>
        <Link to="/admin/articles">{t('home.viewAll')} <RightOutlined /></Link>
      </div>
      <div className="admin-recent-list">
        {articles.map((article) => (
          <div className="admin-recent-item" key={article.id}>
            <div className="admin-article-cover">{(article.titleZh || article.titleEn || 'A').slice(0, 2)}</div>
            <div>
              <strong>{article.titleZh || article.titleEn}</strong>
              <p>{article.slug} · {t('admin.views')} {article.viewCount} · {dayjs(article.updatedAt).format('YYYY/MM/DD HH:mm')}</p>
            </div>
            <span className={article.status === ArticleStatus.PUBLISHED ? 'admin-status published' : 'admin-status draft'}>
              {article.status === ArticleStatus.PUBLISHED ? t('admin.published') : t('admin.draft')}
            </span>
          </div>
        ))}
        {!articles.length && <div className="admin-empty">{t('articles.empty')}</div>}
      </div>
    </Card>
  );
}
