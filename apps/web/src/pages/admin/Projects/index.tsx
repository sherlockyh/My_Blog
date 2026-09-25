// 页面用途：管理后台项目列表和项目编辑弹窗入口。
import { useState } from 'react';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ProjectDTO } from '@my-blog/shared';
import { adminProjectApi } from '@/services/project';
import ListPage from '@/components/admin/ListPage';
import { usePagedList } from '@/hooks/usePagedList';
import ProjectEditModal, { type ProjectModalMode } from './components/ProjectEditModal';

export default function AdminProjects() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ProjectModalMode>('create');
  const [editing, setEditing] = useState<ProjectDTO | null>(null);

  const { data, page, pageSize, loading, loadFailed, setPage, setPageSize, reload } = usePagedList(
    (p, ps) => adminProjectApi.adminProjects({ page: p, pageSize: ps }),
  );

  const openModal = (row?: ProjectDTO, nextMode: ProjectModalMode = row ? 'edit' : 'create') => {
    setModalMode(nextMode);
    setEditing(row ?? null);
    setOpen(true);
  };

  const remove = async (id: number) => {
    await adminProjectApi.deleteProject(id);
    message.success(t('admin.deleted'));
    reload();
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
    {
      title: t('admin.title'),
      key: 'title',
      ellipsis: true,
      render: (_, r) => r.titleZh || r.titleEn,
    },
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
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="btn-gradient"
            onClick={() => openModal()}
          >
            {t('admin.newProject')}
          </Button>
        }
        loadFailed={loadFailed}
        onRetry={() => void reload()}
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
        onSaved={() => void reload()}
      />
    </>
  );
}
