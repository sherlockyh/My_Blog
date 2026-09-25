// 页面用途：管理后台留言列表、查看和删除操作。
import { useState } from 'react';
import { Button, Popconfirm, Space, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { MessageDTO } from '@my-blog/shared';
import { adminMessageApi } from '@/services/message';
import ListPage from '@/admin/components/ListPage';
import { usePagedList } from '@/admin/hooks/usePagedList';
import MessageDetailModal from './components/MessageDetailModal';

export default function AdminMessages() {
  const { t } = useTranslation();
  const [viewing, setViewing] = useState<MessageDTO | null>(null);

  const { data, page, pageSize, loading, loadFailed, setPage, setPageSize, reload } = usePagedList(
    (p, ps) => adminMessageApi.adminMessages({ page: p, pageSize: ps }),
  );

  const remove = async (id: number) => {
    await adminMessageApi.deleteMessage(id);
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
  const columns: ColumnsType<MessageDTO> = [
    { title: t('admin.nickname'), dataIndex: 'nickname', key: 'nickname', width: 140 },
    { title: t('admin.content'), dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: t('admin.updatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('admin.actions'),
      key: 'actions',
      fixed: 'right',
      width: 180,
      className: 'admin-action-column',
      render: (_, r) => (
        <Space className="admin-table-actions">
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewing(r)}>
            {t('common.view')}
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
      <ListPage<MessageDTO>
        title={t('admin.messageManage')}
        description={t('admin.messageManageDesc')}
        loadFailed={loadFailed}
        onRetry={() => void reload()}
        rowKey="id"
        loading={loading}
        dataSource={data?.items || []}
        pagination={pagination}
        scroll={{ x: 900 }}
        columns={columns}
      />
      <MessageDetailModal message={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
