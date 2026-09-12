import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';
import mr from './mr.json';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const supportedLanguages: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

const VALID_CODES = ['en', 'hi', 'gu', 'mr'];

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  const saved =
    localStorage.getItem('healthconnect_language') ||
    localStorage.getItem('sanjeevani_language') ||
    'en';
  return VALID_CODES.includes(saved) ? saved : 'en';
};

const savedLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
    mr: { translation: mr },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Clean up any lingering Google Translate cookies from previous sessions
if (typeof document !== 'undefined') {
  try {
    const host = window.location.hostname;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; Max-Age=-99999999; path=/;';
    if (host && host.includes('.')) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;
    }
  } catch {
    // Ignore cookie cleanup errors
  }
}

/**
 * Primary function to switch application language natively
 */
export const changeAppLanguage = (langCode: string) => {
  const validCode = VALID_CODES.includes(langCode) ? langCode : 'en';
  localStorage.setItem('healthconnect_language', validCode);
  localStorage.setItem('sanjeevani_language', validCode);

  // Update i18next language
  i18n.changeLanguage(validCode);

  // Dispatch custom window event so any non-react listeners can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('healthconnect-language-change', { detail: { language: validCode } })
    );
  }
};

export default i18n;


