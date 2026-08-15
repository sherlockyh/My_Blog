import { useEffect, useState } from 'react';
import { Button, Popconfirm, Space, Table, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ArticleStatus, type ArticleDTO } from '@my-blog/shared';
import { api } from '../../services/api';

export default function AdminArticles() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ArticleDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.adminArticles().then(setRows).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    await api.deleteArticle(id);
    message.success(t('admin.deleted'));
    load();
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link to="/admin/articles/new">
          <Button type="primary" icon={<PlusOutlined />} className="btn-gradient">
            {t('admin.newArticle')}
          </Button>
        </Link>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: t('admin.title'), dataIndex: 'titleZh', key: 'title', render: (_, r) => r.titleZh || r.titleEn },
          {
            title: t('admin.status'),
            dataIndex: 'status',
            key: 'status',
            render: (s: ArticleStatus) =>
              s === ArticleStatus.PUBLISHED ? (
                <Tag color="success">{t('admin.published')}</Tag>
              ) : (
                <Tag>{t('admin.draft')}</Tag>
              ),
          },
          { title: t('admin.views'), dataIndex: 'viewCount', key: 'viewCount', width: 100 },
          {
            title: t('admin.updatedAt'),
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
          },
          {
            title: t('admin.actions'),
            key: 'actions',
            render: (_, r) => (
              <Space>
                <Button size="small" onClick={() => navigate(`/admin/articles/${r.id}`)}>
                  {t('admin.edit')}
                </Button>
                <Popconfirm title={t('admin.confirmDelete')} onConfirm={() => remove(r.id)}>
                  <Button size="small" danger>
                    {t('admin.delete')}
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
