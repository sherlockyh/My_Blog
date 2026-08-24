import { lazy } from 'react';

// 后台页面和 Markdown 编辑器依赖较重，路由级懒加载能显著降低公开站点首包体积。
export const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
export const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
export const Home = lazy(() => import('../pages/home'));
export const About = lazy(() => import('../pages/about'));
export const ArticleList = lazy(() => import('../pages/articles/ArticleList'));
export const ArticleDetail = lazy(() => import('../pages/articles/ArticleDetail'));
export const Archives = lazy(() => import('../pages/archives'));
export const Categories = lazy(() => import('../pages/categories'));
export const Tags = lazy(() => import('../pages/tags'));
export const Projects = lazy(() => import('../pages/projects'));
export const Resources = lazy(() => import('../pages/resources'));
export const Guestbook = lazy(() => import('../pages/guestbook'));
export const AdminLogin = lazy(() => import('../pages/admin/Login'));
export const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
export const AdminArticles = lazy(() => import('../pages/admin/Articles'));
export const AdminProjects = lazy(() => import('../pages/admin/Projects'));
export const AdminResources = lazy(() => import('../pages/admin/Resources'));
export const AdminMessages = lazy(() => import('../pages/admin/Messages'));
export const AdminSiteConfig = lazy(() => import('../pages/admin/SiteConfig'));
export const AdminProfile = lazy(() => import('../pages/admin/Profile'));
