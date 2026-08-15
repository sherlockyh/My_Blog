import { Button, Layout, Menu, message } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
  ProjectOutlined,
  SettingOutlined,
  ShareAltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';

export default function AdminLayout() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const location = useLocation();

  if (!token) return <Navigate to="/admin/login" replace />;

  const items = [
    { key: '/admin', icon: <DashboardOutlined />, label: t('admin.dashboard') },
    { key: '/admin/articles', icon: <FileTextOutlined />, label: t('admin.articles') },
    { key: '/admin/projects', icon: <ProjectOutlined />, label: t('admin.projects') },
    { key: '/admin/resources', icon: <ShareAltOutlined />, label: t('admin.resources') },
    { key: '/admin/messages', icon: <MessageOutlined />, label: t('admin.messages') },
    { key: '/admin/site-config', icon: <SettingOutlined />, label: t('admin.siteConfig') },
    { key: '/admin/profile', icon: <UserOutlined />, label: t('admin.profile') },
  ];

  const selected =
    [...items]
      .sort((a, b) => b.key.length - a.key.length)
      .find((i) => (i.key === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(i.key)))?.key ||
    '/admin';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider breakpoint="lg" collapsedWidth={64}>
        <div className="admin-logo">Code with Joy</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selected]} items={items} onClick={({ key }) => navigate(key)} />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="admin-header">
          <Link to="/" className="admin-back">
            <HomeOutlined /> {t('admin.backHome')}
          </Link>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => {
              clear();
              message.success(t('admin.logout'));
              navigate('/admin/login');
            }}
          >
            {t('admin.logout')}
          </Button>
        </Layout.Header>
        <Layout.Content className="admin-content">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
