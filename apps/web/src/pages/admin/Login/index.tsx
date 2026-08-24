// 页面用途：提供后台管理员登录入口。
import { Button, Form, Input, message } from 'antd';
import { FileTextOutlined, LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import AdminThemeProvider from '@/components/admin/AdminThemeProvider';
import './styles/index.module.less';

export default function AdminLogin() {
  const { t } = useTranslation();
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const submit = async () => {
    const values = await form.validateFields();
    const res = await authApi.login(values);
    setToken(res.token);
    message.success(t('admin.loginOk'));
    navigate('/admin');
  };

  return (
    <AdminThemeProvider>
      <div className="admin-login-page">
        <section className="admin-login-panel">
          <div className="admin-login-hero">
            <div className="admin-login-brand">
              <span className="admin-login-logo">
                <FileTextOutlined />
              </span>
              <div>
                <strong>Code with Joy</strong>
                <span>{t('admin.adminConsole')}</span>
              </div>
            </div>
            <div className="admin-login-copy">
              <span className="admin-login-kicker">{t('admin.secureLogin')}</span>
              <h1>{t('admin.loginTitle')}</h1>
              <p>{t('admin.loginSubtitle')}</p>
            </div>
            <div className="admin-login-metrics">
              <div>
                <strong>24h</strong>
                <span>{t('admin.contentGuard')}</span>
              </div>
              <div>
                <strong>API</strong>
                <span>{t('admin.dataSync')}</span>
              </div>
              <div>
                <strong>UI</strong>
                <span>{t('admin.visualManage')}</span>
              </div>
            </div>
          </div>

          <div className="admin-login-card">
            <div className="admin-login-card-title">
              <span>
                <SafetyCertificateOutlined />
              </span>
              <div>
                <h2>{t('admin.login')}</h2>
                <p>{t('admin.loginHint')}</p>
              </div>
            </div>
            <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
              <Form.Item name="username" label={t('admin.username')} rules={[{ required: true }]}>
                <Input size="large" prefix={<UserOutlined />} autoComplete="username" />
              </Form.Item>
              <Form.Item name="password" label={t('admin.password')} rules={[{ required: true }]}>
                <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block size="large" className="btn-gradient admin-login-submit">
                {t('admin.loginBtn')}
              </Button>
            </Form>
          </div>
        </section>
      </div>
    </AdminThemeProvider>
  );
}
