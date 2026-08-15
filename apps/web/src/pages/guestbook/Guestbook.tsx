import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, List, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { MessageDTO } from '@my-blog/shared';
import { api } from '../../services/api';

export default function Guestbook() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [form] = Form.useForm();

  const load = () => {
    api.messages().then(setMessages).catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const values = await form.validateFields();
    await api.postMessage(values);
    message.success(t('guestbook.submitOk'));
    form.resetFields();
    load();
  };

  return (
    <div className="container section guestbook">
      <div className="section-header">
        <h2 className="section-title">
          <MessageOutlined /> {t('guestbook.title')}
        </h2>
      </div>
      <p className="guestbook-subtitle">{t('guestbook.subtitle')}</p>

      <Card className="guestbook-form">
        <Form form={form} layout="vertical">
          <Form.Item name="nickname" label={t('guestbook.nickname')} rules={[{ required: true, max: 20 }]}>
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item name="content" label={t('guestbook.content')} rules={[{ required: true, max: 500 }]}>
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
          <Button type="primary" className="btn-gradient" onClick={submit}>
            {t('guestbook.submit')}
          </Button>
        </Form>
      </Card>

      <List
        className="guestbook-list"
        dataSource={messages}
        renderItem={(m) => (
          <List.Item className="card guestbook-item">
            <List.Item.Meta
              avatar={<div className="guestbook-avatar">{m.nickname.slice(0, 1).toUpperCase()}</div>}
              title={
                <span className="guestbook-meta">
                  {m.nickname}
                  <span className="meta">{dayjs(m.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                </span>
              }
              description={m.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
