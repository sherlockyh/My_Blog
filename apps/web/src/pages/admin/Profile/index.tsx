// 页面用途：管理个人公开资料和账户展示信息。
import { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { siteApi } from '@/services/site';
import { uploadApi } from '@/services/upload';
import { validateImageFile } from '@/utils/upload';
import { useBeforeUnloadWhenDirty, useDirtyConfirm } from '@/hooks/useDirtyConfirm';
import AccountOverviewCard from './components/AccountOverviewCard';
import ProfileFooterActions from './components/ProfileFooterActions';
import ProfileFormCard, { type ProfileFormValues } from './components/ProfileFormCard';
import './styles/index.module.less';

export default function AdminProfile() {
  const { t } = useTranslation();
  const [form] = Form.useForm<ProfileFormValues>();
  const [avatar, setAvatar] = useState('');
  const [initialAvatar, setInitialAvatar] = useState('');
  const [initialValues, setInitialValues] = useState<ProfileFormValues | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const confirmDirty = useDirtyConfirm(dirty);
  useBeforeUnloadWhenDirty(dirty);

  useEffect(() => {
    siteApi.site().then(({ profile }) => {
      const values = {
        name: profile.name,
        bioZh: profile.bioZh,
        bioEn: profile.bioEn,
        location: profile.location,
        socials: profile.socials,
      };
      form.setFieldsValue(values);
      setInitialValues(values);
      setAvatar(profile.avatar);
      setInitialAvatar(profile.avatar);
      setDirty(false);
    });
  }, []);

  const uploadAvatar = async (file: File) => {
    if (!validateImageFile(file)) return false;
    const { url } = await uploadApi.upload(file);
    setAvatar(url);
    setDirty(true);
    return false;
  };

  const resetProfile = () => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
    setAvatar(initialAvatar);
    setDirty(false);
  };

  const save = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await siteApi.updateProfile({ ...values, avatar });
      message.success(t('admin.saved'));
      setInitialValues(values);
      setInitialAvatar(avatar);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page admin-profile-page">
      <div className="admin-page-head">
        <div className="admin-title-with-icon">
          <span><UserOutlined /></span>
          <div>
            <h1>{t('admin.profile')}</h1>
            <p>{t('admin.profileDesc')}</p>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" requiredMark={false} onValuesChange={() => setDirty(true)}>
        <div className="admin-profile-grid">
          <ProfileFormCard avatar={avatar} onUploadAvatar={uploadAvatar} onDirty={() => setDirty(true)} />
          <AccountOverviewCard form={form} avatar={avatar} />
        </div>
      </Form>
      <ProfileFooterActions saving={saving} onReset={() => confirmDirty(resetProfile)} onSave={save} />
    </div>
  );
}
