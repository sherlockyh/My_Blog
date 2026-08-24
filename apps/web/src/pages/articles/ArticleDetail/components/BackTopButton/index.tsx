// 组件用途：在文章阅读进度较深时提供返回顶部按钮。
import { ArrowUpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface BackTopButtonProps {
  visible: boolean;
}

export default function BackTopButton({ visible }: BackTopButtonProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <button
      type="button"
      className="article-back-top"
      aria-label={t('articles.backTop')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUpOutlined />
    </button>
  );
}
