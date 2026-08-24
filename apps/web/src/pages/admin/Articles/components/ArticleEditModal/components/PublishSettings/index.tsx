// 组件用途：维护文章发布状态和标签设置。
import { Card, Form, Select } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { SelectProps } from 'antd';
import { ArticleStatus } from '@my-blog/shared';

interface PublishSettingsProps {
  isViewMode: boolean;
  tagOptions: SelectProps['options'];
}

export default function PublishSettings({ isViewMode, tagOptions }: PublishSettingsProps) {
  const { t } = useTranslation();

  return (
    <Card className="admin-panel admin-publish-card" title={t('admin.publishSettings')}>
      <Form.Item name="status" label={t('admin.status')}>
        <Select
          disabled={isViewMode}
          options={[
            { value: ArticleStatus.PUBLISHED, label: t('admin.published') },
            { value: ArticleStatus.DRAFT, label: t('admin.draft') },
          ]}
        />
      </Form.Item>
      <Form.Item name="tags" label={t('admin.tags')}>
        <Select
          mode="tags"
          disabled={isViewMode}
          tokenSeparators={[',', '，']}
          options={tagOptions}
          placeholder={t('admin.tagsPlaceholder')}
        />
      </Form.Item>
      <div className="admin-tag-helper">
        <TagsOutlined />
        <span>{t('admin.tagHelper')}</span>
      </div>
    </Card>
  );
}
