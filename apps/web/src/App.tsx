import { useEffect } from 'react';
import { ConfigProvider, theme as antTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from './store/theme';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/home/Home';
import About from './pages/about/About';
import ArticleList from './pages/articles/ArticleList';
import ArticleDetail from './pages/articles/ArticleDetail';
import Projects from './pages/projects/Projects';
import Resources from './pages/resources/Resources';
import Guestbook from './pages/guestbook/Guestbook';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminArticles from './pages/admin/Articles';
import ArticleEdit from './pages/admin/ArticleEdit';
import AdminProjects from './pages/admin/Projects';
import AdminResources from './pages/admin/Resources';
import AdminMessages from './pages/admin/Messages';
import AdminSiteConfig from './pages/admin/SiteConfig';
import AdminProfile from './pages/admin/Profile';

export default function App() {
  const mode = useThemeStore((s) => s.theme);
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <ConfigProvider
      locale={i18n.language === 'en' ? enUS : zhCN}
      theme={{
        algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff', borderRadius: 8 },
      }}
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/:slug" element={<ArticleDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="resources" element={<Resources />} />
          <Route path="guestbook" element={<Guestbook />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<ArticleEdit />} />
          <Route path="articles/:id" element={<ArticleEdit />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="site-config" element={<AdminSiteConfig />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  );
}
