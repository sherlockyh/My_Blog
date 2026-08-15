import { useEffect, useState } from 'react';
import { Button, Popconfirm, Table, message } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { MessageDTO } from '@my-blog/shared';
import { api } from '../../services/api';

export default function AdminMessages() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<MessageDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.adminMessages().then(setRows).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    await api.deleteMessage(id);
    message.success(t('admin.deleted'));
    load();
  };

  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={rows}
      columns={[
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
          width: 100,
          render: (_, r) => (
            <Popconfirm title={t('admin.confirmDelete')} onConfirm={() => remove(r.id)}>
              <Button size="small" danger>
                {t('admin.delete')}
              </Button>
            </Popconfirm>
          ),
        },
      ]}
    />
  );
}
