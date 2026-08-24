// 组件用途：展示文章详情页左侧分类切换栏。
import { FileTextOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from '@ant-design/icons';
import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface ArticleLeftRailProps {
  collapsed: boolean;
  treeValue?: string;
  treeData: TreeSelectProps['treeData'];
  onExpand: () => void;
  onCollapse: () => void;
  onSelectArticle: (slug: string) => void;
}

export default function ArticleLeftRail({
  collapsed,
  treeValue,
  treeData,
  onExpand,
  onCollapse,
  onSelectArticle,
}: ArticleLeftRailProps) {
  const { t } = useTranslation();

  return (
    <aside className={`article-left-rail${collapsed ? ' collapsed' : ''}`}>
      <button
        type="button"
        className="card article-left-rail-toggle"
        aria-label={t('common.expand')}
        onClick={onExpand}
      >
        <MenuUnfoldOutlined />
      </button>
      <div className="article-left-rail-content">
        <div className="card article-side-search">
          <SearchOutlined />
          <span>{t('articles.search')}</span>
        </div>
        <section className="card sidebar-card article-category-card">
          <div className="article-sidebar-header">
            <h3 className="sidebar-title">
              <FileTextOutlined /> {t('articles.categories')}
            </h3>
            <button
              type="button"
              className="article-collapse-btn"
              aria-label={t('common.collapse')}
              onClick={onCollapse}
            >
              <MenuFoldOutlined />
            </button>
          </div>
          <div className="article-category-panel">
            <p className="article-category-tree-hint">{t('articles.switchArticle')}</p>
            <TreeSelect
              className="article-tree-select"
              popupClassName="article-tree-select-popup"
              value={treeValue}
              treeData={treeData}
              treeDefaultExpandAll
              showSearch
              treeNodeFilterProp="title"
              placeholder={t('articles.switchArticle')}
              onChange={(value) => {
                const nextSlug = String(value).split('::')[1];
                if (nextSlug) onSelectArticle(nextSlug);
              }}
            />
          </div>
        </section>
      </div>
    </aside>
  );
}
