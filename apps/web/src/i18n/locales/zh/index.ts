import admin from './admin';
import nav from './nav';
import home from './home';
import articles from './articles';
import pages from './pages';
import about from './about';
import common from './common';

const zh = {
  ...nav,
  ...home,
  ...articles,
  ...pages,
  ...about,
  ...common,
  admin,
};

export default zh;
