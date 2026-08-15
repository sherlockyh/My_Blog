import i18n from '../i18n';

/** 按当前语言取双语字段，En 为空回退 Zh */
export const pick = (zh?: string, en?: string): string => {
  if (i18n.language === 'en') return en || zh || '';
  return zh || en || '';
};
