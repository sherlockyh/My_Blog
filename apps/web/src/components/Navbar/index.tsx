// 组件用途：展示公开站点顶部导航、主题切换和语言切换入口。
import { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { CodeOutlined, MenuOutlined } from '@ant-design/icons';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '@/components/ThemeToggle';
import './styles/index.module.less';

const NAV_KEYS = [
  { key: '/', i18n: 'nav.home' },
  { key: '/about', i18n: 'nav.about' },
  { key: '/articles', i18n: 'nav.articles' },
  { key: '/projects', i18n: 'nav.projects' },
  { key: '/resources', i18n: 'nav.resources' },
  { key: '/guestbook', i18n: 'nav.guestbook' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    document.documentElement.lang = i18n.language === 'en' ? 'en' : 'zh-CN';
  }, [i18n.language]);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <CodeOutlined className="logo-icon" />
          <span className="logo-text">Code with Joy</span>
        </Link>

        <nav className="nav-links">
          {NAV_KEYS.map((item) => (
            <NavLink
              key={item.key}
              to={item.key}
              end={item.key === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {t(item.i18n)}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          <button type="button" className="pill-btn lang" onClick={toggleLang}>
            {i18n.language === 'zh' ? 'EN' : '中'}
          </button>
          <ThemeToggle />
          <button type="button" className="menu-btn" onClick={() => setDrawer(true)}>
            <MenuOutlined />
          </button>
        </div>
      </div>

      <Drawer title="Code with Joy" open={drawer} onClose={() => setDrawer(false)} placement="right">
        <div className="drawer-nav">
          {NAV_KEYS.map((item) => (
            <NavLink
              key={item.key}
              to={item.key}
              end={item.key === '/'}
              onClick={() => setDrawer(false)}
              className={({ isActive }) => `drawer-link${isActive ? ' active' : ''}`}
            >
              {t(item.i18n)}
            </NavLink>
          ))}
        </div>
      </Drawer>
    </header>
  );
}
