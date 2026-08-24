// 组件用途：封装 Markdown 编辑和只读预览区域。
import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onPreview: () => void;
  readOnly?: boolean;
}

export default function ContentEditor({ value, onChange, onPreview, readOnly }: ContentEditorProps) {
  const { t } = useTranslation();

  return (
    <div className="admin-markdown-workbench" data-color-mode="light">
      <div className="admin-markdown-editor-pane">
        <div className="admin-section-label admin-section-label-between">
          <span>{t('admin.writingArea')}</span>
          <Button size="small" icon={<EyeOutlined />} onClick={onPreview}>
            {t('admin.preview')}
          </Button>
        </div>
        {readOnly ? (
          <div className="admin-markdown-preview admin-markdown-viewer">
            {value ? <MDEditor.Markdown source={value} /> : <p className="admin-preview-empty">{t('articles.emptyContent')}</p>}
          </div>
        ) : (
          <MDEditor
            value={value}
            preview="edit"
            onChange={(nextValue) => onChange(nextValue || '')}
            height={520}
          />
        )}
      </div>
    </div>
  );
}
