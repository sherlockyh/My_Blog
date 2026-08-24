// 组件用途：渲染文章中英文内容编辑标签页。
import { Card, Form, Input, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import ContentEditor from '../ContentEditor';

interface ArticleContentTabsProps {
  contentZh: string;
  contentEn: string;
  isViewMode: boolean;
  onContentZhChange: (value: string) => void;
  onContentEnChange: (value: string) => void;
  onPreview: (content: string) => void;
}

export default function ArticleContentTabs({
  contentZh,
  contentEn,
  isViewMode,
  onContentZhChange,
  onContentEnChange,
  onPreview,
}: ArticleContentTabsProps) {
  const { t } = useTranslation();

  return (
    <Card className="admin-panel admin-editor-card">
      <Form.Item name="slug" label={t('admin.slug')} rules={[{ required: true }]}>
        <Input size="large" placeholder="my-first-post" disabled={isViewMode} />
      </Form.Item>
      <Tabs
        items={[
          {
            key: 'zh',
            label: t('admin.zhTab'),
            children: (
              <div className="admin-language-panel">
                <Form.Item name="titleZh" label={t('admin.articleTitle')} rules={[{ required: true }]}>
                  <Input size="large" placeholder={t('admin.titlePlaceholder')} disabled={isViewMode} />
                </Form.Item>
                <Form.Item name="summaryZh" label={t('admin.summary')}>
                  <Input.TextArea rows={3} showCount maxLength={180} placeholder={t('admin.summaryPlaceholder')} disabled={isViewMode} />
                </Form.Item>
                <ContentEditor
                  value={contentZh}
                  readOnly={isViewMode}
                  onPreview={() => onPreview(contentZh)}
                  onChange={onContentZhChange}
                />
              </div>
            ),
          },
          {
            key: 'en',
            label: t('admin.enTab'),
            children: (
              <div className="admin-language-panel">
                <Form.Item name="titleEn" label={t('admin.articleTitle')}>
                  <Input size="large" placeholder={t('admin.titlePlaceholder')} disabled={isViewMode} />
                </Form.Item>
                <Form.Item name="summaryEn" label={t('admin.summary')}>
                  <Input.TextArea rows={3} showCount maxLength={180} placeholder={t('admin.summaryPlaceholder')} disabled={isViewMode} />
                </Form.Item>
                <ContentEditor
                  value={contentEn}
                  readOnly={isViewMode}
                  onPreview={() => onPreview(contentEn)}
                  onChange={onContentEnChange}
                />
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
}
