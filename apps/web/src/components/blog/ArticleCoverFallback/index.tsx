// 组件用途：在文章无封面时展示统一的占位封面。
import './styles/index.module.less';

interface ArticleCoverFallbackProps {
  label: string;
}

export default function ArticleCoverFallback({ label }: ArticleCoverFallbackProps) {
  return (
    <div className="blog-cover-generated" aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}
