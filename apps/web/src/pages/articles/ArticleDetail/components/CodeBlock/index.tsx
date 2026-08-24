// 组件用途：渲染文章代码块并提供复制功能。
import { useState } from 'react';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(code);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="article-code-block">
      <div className="article-code-toolbar">
        <span>{language || 'code'}</span>
        <button type="button" aria-label={copied ? t('articles.copied') : t('articles.copy')} onClick={copy}>
          {copied ? <CheckOutlined /> : <CopyOutlined />}
          {copied ? t('articles.copied') : t('articles.copy')}
        </button>
      </div>
      <pre>
        <code className={language ? `language-${language}` : undefined}>{code}</code>
      </pre>
    </div>
  );
}
