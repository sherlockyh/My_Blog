import type { RouteObject } from 'react-router-dom';
import {
  About,
  Archives,
  ArticleDetail,
  ArticleList,
  Categories,
  Guestbook,
  Home,
  Projects,
  PublicLayout,
  Resources,
  Tags,
} from './lazyPages';

export const publicRoutes: RouteObject[] = [
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
