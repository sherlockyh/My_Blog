import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useThemeStore } from '../store/theme';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="theme-toggle">
      <button
        type="button"
        className={theme === 'light' ? 'active' : ''}
        onClick={() => setTheme('light')}
        aria-label="light"
      >
        <SunOutlined />
      </button>
      <button
        type="button"
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => setTheme('dark')}
        aria-label="dark"
      >
        <MoonOutlined />
      </button>
    </div>
  );
}
