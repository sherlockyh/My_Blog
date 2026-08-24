// 页面用途：管理后台资源列表和资源编辑弹窗入口。
import { useEffect, useState } from 'react';
import { Button, Popconfirm, Space, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Paged, ResourceDTO } from '@my-blog/shared';
import { adminResourceApi } from '@/services/resource';
import ListPage from '@/components/admin/ListPage';
import ResourceEditModal, { type ResourceModalMode } from './components/ResourceEditModal';

export default function AdminResources() {
  const { t } = useTranslation();
  const [data, setData] = useState<Paged<ResourceDTO> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ResourceModalMode>('create');
  const [editing, setEditing] = useState<ResourceDTO | null>(null);

  const load = (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    setLoadFailed(false);
    adminResourceApi
      .adminResources({ page: nextPage, pageSize: nextPageSize })
      .then(setData)
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [page, pageSize]);

  const openModal = (row?: ResourceDTO, nextMode: ResourceModalMode = row ? 'edit' : 'create') => {
    setModalMode(nextMode);
    setEditing(row ?? null);
    setOpen(true);
  };

  const remove = async (id: number) => {
    await adminResourceApi.deleteResource(id);
    message.success(t('admin.deleted'));
    load();
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
  const columns: ColumnsType<ResourceDTO> = [
    { title: t('admin.title'), key: 'title', ellipsis: true, render: (_, r) => r.titleZh || r.titleEn },
    { title: t('admin.category'), dataIndex: 'category', key: 'category', width: 120 },
    { title: t('admin.link'), dataIndex: 'link', key: 'link', ellipsis: true },
    {
      title: t('admin.actions'),
      key: 'actions',
      fixed: 'right',
      width: 260,
      className: 'admin-action-column',
      render: (_, r) => (
        <Space className="admin-table-actions">
          <Button size="small" icon={<EyeOutlined />} onClick={() => openModal(r, 'view')}>
            {t('common.view')}
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)}>
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
      <ListPage<ResourceDTO>
        title={t('admin.resourceManage')}
        description={t('admin.resourceManageDesc')}
        actions={(
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient" onClick={() => openModal()}>
          {t('admin.newResource')}
        </Button>
        )}
        loadFailed={loadFailed}
        onRetry={load}
        rowKey="id"
        loading={loading}
        dataSource={data?.items || []}
        pagination={pagination}
        scroll={{ x: 1000 }}
        columns={columns}
      />
      <ResourceEditModal
        open={open}
        mode={modalMode}
        resource={editing}
        onClose={() => setOpen(false)}
        onSaved={load}
      />
    </>
  );
}
