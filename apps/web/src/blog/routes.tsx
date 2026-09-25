import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const PublicLayout = lazy(() => import('./layout/PublicLayout'));
const Home = lazy(() => import('./pages/home'));
const About = lazy(() => import('./pages/about'));
const ArticleList = lazy(() => import('./pages/articles/ArticleList'));
const ArticleDetail = lazy(() => import('./pages/articles/ArticleDetail'));
const Archives = lazy(() => import('./pages/archives'));
const Categories = lazy(() => import('./pages/categories'));
const Tags = lazy(() => import('./pages/tags'));
const Projects = lazy(() => import('./pages/projects'));
const Resources = lazy(() => import('./pages/resources'));
const Guestbook = lazy(() => import('./pages/guestbook'));

export const blogRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'articles', element: <ArticleList /> },
      { path: 'articles/:slug', element: <ArticleDetail /> },
      { path: 'archives', element: <Archives /> },
      { path: 'categories', element: <Categories /> },
      { path: 'tags', element: <Tags /> },
      { path: 'projects', element: <Projects /> },
      { path: 'resources', element: <Resources /> },
      { path: 'guestbook', element: <Guestbook /> },
    ],
  },
];
