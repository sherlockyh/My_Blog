// 组件用途：渲染文章封面、摘要和 Markdown 正文。
import type { HTMLAttributes, ReactNode } from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArticleCoverFallback from '@/components/blog/ArticleCoverFallback';
import CodeBlock from '../CodeBlock';
import type { TocItem } from '../../utils/toc';

interface ArticleBodyProps {
  title: string;
  primaryTag: string;
  cover: string;
  summary: string;
  content: string;
  theme: string;
  toc: TocItem[];
}

export default function ArticleBody({ title, primaryTag, cover, summary, content, theme, toc }: ArticleBodyProps) {
  const { t } = useTranslation();
  let headingRenderIndex = 0;
  const renderHeading = (level: 2 | 3, children: ReactNode) => {
    const item = toc[headingRenderIndex];
    headingRenderIndex += 1;
    return level === 2 ? <h2 id={item?.id}>{children}</h2> : <h3 id={item?.id}>{children}</h3>;
  };

  return (
    <>
      <div className="article-detail-cover card">
        {cover ? (
          <img src={cover} alt={title} />
        ) : (
          <ArticleCoverFallback label={primaryTag} />
        )}
      </div>

      {summary && (
        <div className="article-summary-card">
          <FileTextOutlined />
          <p>{summary}</p>
        </div>
      )}

      <div className={`markdown-card markdown-body${theme === 'dark' ? ' dark' : ''}`}>
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => renderHeading(2, children),
              h3: ({ children }) => renderHeading(3, children),
              pre: ({ children }) => <>{children}</>,
              code: ({ children, className, ...props }) => {
                const codeProps = props as HTMLAttributes<HTMLElement> & { inline?: boolean };
                const language = /language-(\w+)/.exec(className || '')?.[1];
                if (codeProps.inline || !language) {
                  return <code className={className} {...codeProps}>{children}</code>;
                }
                return <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <p className="article-empty-content">{t('articles.emptyContent')}</p>
        )}
      </div>
    </>
  );
}
