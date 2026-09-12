import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';
import mr from './mr.json';

const savedLanguage = localStorage.getItem('healthconnect_language') || localStorage.getItem('sanjeevani_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      gu: { translation: gu },
      mr: { translation: mr }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
];

export const changeAppLanguage = (langCode: string) => {
  localStorage.setItem('healthconnect_language', langCode);
  localStorage.setItem('sanjeevani_language', langCode);
  i18n.changeLanguage(langCode);
};

export default i18n;
