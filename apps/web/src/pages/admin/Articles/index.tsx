// 页面用途：管理后台文章列表、筛选、分页和编辑弹窗入口。
import { useEffect, useState } from 'react';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, EyeOutlined, FileTextOutlined, PlusOutlined, ReloadOutlined, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ArticleStatus, type ArticleDTO, type Paged } from '@my-blog/shared';
import { adminArticleApi } from '@/services/article';
import ListPage, { type FilterField, type FilterValue } from '@/components/admin/ListPage';
import ArticleEditModal, { type ArticleModalMode } from './components/ArticleEditModal';
import './styles/index.module.less';

export default function AdminArticles() {
  const { t } = useTranslation();
  const [data, setData] = useState<Paged<ArticleDTO> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<ArticleStatus | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState<ArticleModalMode>('create');
  const [editingId, setEditingId] = useState<number | undefined>();

  const load = (
    nextPage = page,
    nextPageSize = pageSize,
    query: { keyword?: string; status?: ArticleStatus } = { keyword, status },
  ) => {
    setLoading(true);
    setLoadFailed(false);
    adminArticleApi
      .adminArticles({ page: nextPage, pageSize: nextPageSize, keyword: query.keyword || undefined, status: query.status })
      .then(setData)
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [page, pageSize, status]);

  const remove = async (id: number) => {
    await adminArticleApi.deleteArticle(id);
    message.success(t('admin.deleted'));
    load();
  };

  const openArticleModal = (id?: number, mode: ArticleModalMode = id ? 'edit' : 'create') => {
    setEditingId(id);
    setEditMode(mode);
    setEditOpen(true);
  };

  const publishedCount = data?.items.filter((item) => item.status === ArticleStatus.PUBLISHED).length ?? 0;
  const draftCount = data?.items.filter((item) => item.status === ArticleStatus.DRAFT).length ?? 0;
  const featuredCount = data?.items.filter((item) => item.tags.length > 1).length ?? 0;
  const filters: FilterField[] = [
    {
      key: 'keyword',
      label: t('admin.keyword'),
      type: 'input',
      placeholder: t('admin.keywordPlaceholder'),
      allowClear: true,
    },
    {
      key: 'status',
      label: t('admin.status'),
      type: 'select',
      placeholder: t('admin.allStatus'),
      allowClear: true,
      options: [
        { value: ArticleStatus.PUBLISHED, label: t('admin.published') },
        { value: ArticleStatus.DRAFT, label: t('admin.draft') },
      ],
    },
  ];
  const handleFilterChange = (key: string, value: FilterValue) => {
    if (key === 'keyword') {
      setKeyword((value as string | undefined) ?? '');
      return;
    }
    if (key === 'status') {
      setStatus(value as ArticleStatus | undefined);
      setPage(1);
    }
  };
  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total: data?.total || 0,
    showSizeChanger: true,
    position: ['bottomCenter'],
    onChange: (nextPage, nextPageSize) => {
      setPage(nextPage);
      setPageSize(nextPageSize);
    },
  };
  const columns: ColumnsType<ArticleDTO> = [
    {
      title: t('admin.article'),
      dataIndex: 'titleZh',
      key: 'article',
      width: 220,
      ellipsis: true,
      render: (_, r) => (
        <div className="admin-table-article">
          <div className="admin-article-cover">{(r.titleZh || r.titleEn || 'A').slice(0, 2)}</div>
          <div>
            <strong>{r.slug}</strong>
            <p>/{r.slug}</p>
          </div>
        </div>
      ),
    },
    { title: t('admin.title'), dataIndex: 'titleZh', key: 'title', width: 220, ellipsis: true, render: (_, r) => <strong>{r.titleZh || r.titleEn}</strong> },
    {
      title: t('admin.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: ArticleStatus) =>
        s === ArticleStatus.PUBLISHED ? (
          <Tag color="success">{t('admin.published')}</Tag>
        ) : (
          <Tag>{t('admin.draft')}</Tag>
        ),
    },
    {
      title: t('admin.tags'),
      dataIndex: 'tags',
      key: 'tags',
      width: 220,
      ellipsis: true,
      render: (tags: string[]) => (
        <Space size={[4, 4]} wrap>
          {tags.map((tag) => <Tag key={tag} color="blue">{tag}</Tag>)}
        </Space>
      ),
    },
    { title: t('admin.views'), dataIndex: 'viewCount', key: 'viewCount', width: 100 },
    {
      title: t('admin.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('admin.actions'),
      key: 'actions',
      fixed: 'right',
      width: 260,
      className: 'admin-action-column',
      render: (_, r) => (
        <Space className="admin-table-actions">
          <Button size="small" icon={<EyeOutlined />} onClick={() => openArticleModal(r.id, 'view')}>
            {t('common.view')}
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openArticleModal(r.id, 'edit')}>
            {t('admin.edit')}
          </Button>
          <Popconfirm title={t('admin.confirmDelete')} onConfirm={() => remove(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              {t('admin.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ListPage<ArticleDTO>
        className="admin-articles-page"
        title={t('admin.articleManage')}
        description={t('admin.articleManageDesc')}
        actions={(
          <div className="admin-head-actions">
            <Button icon={<ReloadOutlined />} onClick={() => load()}>{t('admin.refresh')}</Button>
          <Button type="primary" icon={<PlusOutlined />} className="btn-gradient" onClick={() => openArticleModal()}>
            {t('admin.newArticle')}
          </Button>
          </div>
        )}
        stats={(
          <div className="admin-stat-grid admin-article-stat-grid">
            <div className="admin-lite-stat">
              <span><FileTextOutlined /></span>
              <div><p>{t('admin.allArticles')}</p><strong>{data?.total ?? 0}</strong></div>
            </div>
            <div className="admin-lite-stat">
              <span><FileTextOutlined /></span>
              <div><p>{t('admin.published')}</p><strong>{publishedCount}</strong></div>
            </div>
            <div className="admin-lite-stat">
              <span><EditOutlined /></span>
              <div><p>{t('admin.draft')}</p><strong>{draftCount}</strong></div>
            </div>
            <div className="admin-lite-stat">
              <span><StarOutlined /></span>
              <div><p>{t('admin.featured')}</p><strong>{featuredCount}</strong></div>
            </div>
          </div>
        )}
        filters={filters}
        filterValues={{ keyword, status }}
        searchText={t('admin.search')}
        resetText={t('admin.reset')}
        onFilterChange={handleFilterChange}
        onSearch={() => {
          setPage(1);
          load(1);
        }}
        onReset={() => {
          setKeyword('');
          setStatus(undefined);
          setPage(1);
          load(1, pageSize, {});
        }}
        loadFailed={loadFailed}
        onRetry={() => load()}
        rowKey="id"
        loading={loading}
        dataSource={data?.items || []}
        scroll={{ x: 1260 }}
        pagination={pagination}
        columns={columns}
      />

      <ArticleEditModal
        open={editOpen}
        mode={editMode}
        articleId={editingId}
        onClose={() => setEditOpen(false)}
        onSaved={() => load()}
      />
    </>
  );
}
