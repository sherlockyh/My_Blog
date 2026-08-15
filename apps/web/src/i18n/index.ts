import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zh from './zh';
import en from './en';

const saved = localStorage.getItem('blog-lang') || 'zh';
dayjs.locale(saved === 'en' ? 'en' : 'zh-cn');

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: saved,
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('blog-lang', lng);
  dayjs.locale(lng === 'en' ? 'en' : 'zh-cn');
});

export default i18n;
