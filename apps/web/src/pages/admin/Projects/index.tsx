// 页面用途：管理后台项目列表和项目编辑弹窗入口。
import { useEffect, useState } from 'react';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Paged, ProjectDTO } from '@my-blog/shared';
import { adminProjectApi } from '@/services/project';
import ListPage from '@/components/admin/ListPage';
import ProjectEditModal, { type ProjectModalMode } from './components/ProjectEditModal';

export default function AdminProjects() {
  const { t } = useTranslation();
  const [data, setData] = useState<Paged<ProjectDTO> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ProjectModalMode>('create');
  const [editing, setEditing] = useState<ProjectDTO | null>(null);

  const load = (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    setLoadFailed(false);
    adminProjectApi
      .adminProjects({ page: nextPage, pageSize: nextPageSize })
      .then(setData)
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [page, pageSize]);

  const openModal = (row?: ProjectDTO, nextMode: ProjectModalMode = row ? 'edit' : 'create') => {
    setModalMode(nextMode);
    setEditing(row ?? null);
    setOpen(true);
  };

  const remove = async (id: number) => {
    await adminProjectApi.deleteProject(id);
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
  const columns: ColumnsType<ProjectDTO> = [
    { title: t('admin.title'), key: 'title', ellipsis: true, render: (_, r) => r.titleZh || r.titleEn },
    {
      title: t('admin.featuredProject'),
      dataIndex: 'featured',
      key: 'featured',
      width: 90,
      render: (v: boolean) => (v ? <Tag color="blue">{t('admin.featuredProject')}</Tag> : '-'),
    },
    { title: t('admin.sort'), dataIndex: 'sort', key: 'sort', width: 80 },
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
      <ListPage<ProjectDTO>
        title={t('admin.projectManage')}
        description={t('admin.projectManageDesc')}
        actions={(
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient" onClick={() => openModal()}>
          {t('admin.newProject')}
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
      <ProjectEditModal
        open={open}
        mode={modalMode}
        project={editing}
        onClose={() => setOpen(false)}
        onSaved={load}
      />
    </>
  );
}
