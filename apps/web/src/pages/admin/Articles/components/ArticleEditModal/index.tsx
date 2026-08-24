// 组件用途：承载文章新增、编辑和查看弹窗的整体流程。
import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ArticleStatus } from '@my-blog/shared';
import { adminArticleApi, articleApi } from '@/services/article';
import { uploadApi } from '@/services/upload';
import type { ArticleInput } from '@/services/api-types';
import { validateImageFile } from '@/utils/upload';
import { useBeforeUnloadWhenDirty, useDirtyConfirm } from '@/hooks/useDirtyConfirm';
import ArticleContentTabs from './components/ArticleContentTabs';
import CoverUploader from './components/CoverUploader';
import MarkdownPreviewModal from './components/MarkdownPreviewModal';
import PublishSettings from './components/PublishSettings';
import './styles/index.module.less';

export type ArticleModalMode = 'create' | 'edit' | 'view';

interface ArticleEditModalProps {
  open: boolean;
  mode: ArticleModalMode;
  articleId?: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function ArticleEditModal({ open, mode, articleId, onClose, onSaved }: ArticleEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [cover, setCover] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const isNew = mode === 'create';
  const isViewMode = mode === 'view';
  const confirmDirty = useDirtyConfirm(open && dirty && !isViewMode);
  useBeforeUnloadWhenDirty(open && dirty && !isViewMode);

  const watchedTags = Form.useWatch('tags', form) as string[] | undefined;
  const tagOptions = useMemo(() => {
    const mergedTags = Array.from(new Set([...(watchedTags || []), ...existingTags]));
    return mergedTags.map((tag) => ({ value: tag, label: tag }));
  }, [existingTags, watchedTags]);

  useEffect(() => {
    if (!open) return;
    articleApi.articleTags().then(setExistingTags).catch(() => setExistingTags([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setContentZh('');
    setContentEn('');
    setCover('');
    setPreviewOpen(false);
    setPreviewContent('');
    setDirty(false);
    if (isNew || !articleId) return;

    adminArticleApi.adminArticle(articleId).then((row) => {
      form.setFieldsValue({
        slug: row.slug,
        titleZh: row.titleZh,
        titleEn: row.titleEn,
        summaryZh: row.summaryZh,
        summaryEn: row.summaryEn,
        tags: row.tags,
        status: row.status,
      });
      setContentZh(row.contentZh || '');
      setContentEn(row.contentEn || '');
      setCover(row.cover);
      setDirty(false);
    });
  }, [articleId, form, isNew, open]);

  const close = () => {
    confirmDirty(() => {
      setDirty(false);
      onClose();
    });
  };

  const save = async () => {
    if (isViewMode) return;
    const values = await form.validateFields();
    const body: ArticleInput = {
      ...values,
      contentZh,
      contentEn,
      cover,
    };
    setSaving(true);
    try {
      if (isNew) {
        await adminArticleApi.createArticle(body);
      } else if (articleId) {
        await adminArticleApi.updateArticle(articleId, body);
      }
      message.success(t('admin.saved'));
      setDirty(false);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file: File) => {
    if (!validateImageFile(file)) return false;
    const { url } = await uploadApi.upload(file);
    setCover(url);
    setDirty(true);
    return false;
  };

  const openPreview = (content: string) => {
    setPreviewContent(content);
    setPreviewOpen(true);
  };

  return (
    <Modal
      open={open}
      title={isViewMode ? t('admin.viewArticle') : isNew ? t('admin.newArticle') : t('admin.editArticle')}
      width={1280}
      centered
      onCancel={close}
      className="admin-article-edit-modal"
      destroyOnClose
      maskClosable={false}
      footer={
        <>
          <Button onClick={close}>{isViewMode ? t('common.close') : t('common.cancel')}</Button>
          {!isViewMode && (
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} className="btn-gradient">
              {t('admin.save')}
            </Button>
          )}
        </>
      }
    >
      <div className="admin-article-edit-page">
        <p className="admin-editor-desc">{t('admin.editorDesc')}</p>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: ArticleStatus.DRAFT, tags: [] }}
          onValuesChange={() => setDirty(true)}
        >
          <div className="admin-editor-layout">
            <div className="admin-editor-main">
              <ArticleContentTabs
                contentZh={contentZh}
                contentEn={contentEn}
                isViewMode={isViewMode}
                onPreview={openPreview}
                onContentZhChange={(nextValue) => {
                  setContentZh(nextValue);
                  setDirty(true);
                }}
                onContentEnChange={(nextValue) => {
                  setContentEn(nextValue);
                  setDirty(true);
                }}
              />
            </div>

            <aside className="admin-editor-side">
              <PublishSettings isViewMode={isViewMode} tagOptions={tagOptions} />
              <CoverUploader
                cover={cover}
                isViewMode={isViewMode}
                onUploadCover={uploadCover}
                onCoverChange={(nextCover) => {
                  setCover(nextCover);
                  setDirty(true);
                }}
              />
            </aside>
          </div>
        </Form>
      </div>

      <MarkdownPreviewModal
        open={previewOpen}
        content={previewContent}
        onClose={() => setPreviewOpen(false)}
      />
    </Modal>
  );
}
