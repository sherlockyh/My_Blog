import { useEffect } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAdminDirtyStore } from '@/store/adminDirty';

export function useBeforeUnloadWhenDirty(dirty: boolean) {
  useEffect(() => {
    useAdminDirtyStore.getState().setDirty(dirty);
    return () => useAdminDirtyStore.getState().setDirty(false);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);
}

export function useDirtyConfirm(dirty: boolean) {
  const { t } = useTranslation();

  return (onConfirm: () => void) => {
    if (!dirty) {
      onConfirm();
      return;
    }

    Modal.confirm({
      title: t('common.unsavedTitle'),
      content: t('common.unsavedDesc'),
      okText: t('common.leave'),
      cancelText: t('common.cancel'),
      onOk: onConfirm,
    });
  };
}
