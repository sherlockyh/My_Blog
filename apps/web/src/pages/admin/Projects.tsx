import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ProjectDTO } from '@my-blog/shared';
import { api } from '../../services/api';

export default function AdminProjects() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDTO | null>(null);
  const [form] = Form.useForm();
  const [cover, setCover] = useState('');

  const load = () => {
    setLoading(true);
    api.adminProjects().then(setRows).finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const openModal = (row?: ProjectDTO) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) {
      form.setFieldsValue(row);
      setCover(row.cover);
    } else {
      setCover('');
    }
    setOpen(true);
  };

  const save = async () => {
    const values = await form.validateFields();
    const body = { ...values, cover };
    if (editing) {
      await api.updateProject(editing.id, body);
    } else {
      await api.createProject(body);
    }
    message.success(t('admin.saved'));
    setOpen(false);
    load();
  };

  const remove = async (id: number) => {
    await api.deleteProject(id);
    message.success(t('admin.deleted'));
    load();
  };

  const uploadCover = async (file: File) => {
    const { url } = await api.upload(file);
    setCover(url);
    return false;
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient" onClick={() => openModal()}>
          {t('admin.newArticle')}
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: t('admin.title'), key: 'title', render: (_, r) => r.titleZh || r.titleEn },
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
            render: (_, r) => (
              <Space>
                <Button size="small" onClick={() => openModal(r)}>
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
      <Modal
        open={open}
        title={editing ? t('admin.edit') : t('admin.newArticle')}
        onOk={save}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ featured: false, sort: 0, tags: [] }}>
          <Form.Item name="titleZh" label={t('admin.titleZh')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="titleEn" label={t('admin.titleEn')}>
            <Input />
          </Form.Item>
          <Form.Item name="descZh" label={t('admin.descZh')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="descEn" label={t('admin.descEn')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label={t('admin.cover')}>
            <Space>
              <Upload accept="image/*" showUploadList={false} beforeUpload={uploadCover}>
                <Button icon={<UploadOutlined />}>{t('admin.cover')}</Button>
              </Upload>
              {cover && <img src={cover} alt="cover" style={{ height: 40, borderRadius: 8 }} />}
            </Space>
          </Form.Item>
          <Form.Item name="tags" label={t('admin.tags')}>
            <Select mode="tags" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="link" label={t('admin.link')}>
            <Input placeholder="https://" />
          </Form.Item>
          <Form.Item name="featured" label={t('admin.featuredProject')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="sort" label={t('admin.sort')}>
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
