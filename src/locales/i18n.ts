import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';
import mr from './mr.json';

const savedLanguage =
  localStorage.getItem('healthconnect_language') ||
  localStorage.getItem('sanjeevani_language') ||
  'en';

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

export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

/**
 * Triggers Google Translate DOM translation engine without requiring full page reload
 */
export const triggerGoogleTranslate = (langCode: string) => {
  if (typeof window === 'undefined') return;

  const targetLang = langCode;

  // 1. Set Google Translate cookies
  try {
    const host = window.location.hostname;
    if (targetLang === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; Max-Age=-99999999; path=/;';
      if (host && host.includes('.')) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;
      }
    } else {
      document.cookie = `googtrans=/en/${targetLang}; path=/;`;
      if (host && host.includes('.')) {
        document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${host};`;
        document.cookie = `googtrans=/en/${targetLang}; path=/; domain=.${host};`;
      }
    }
  } catch (e) {
    console.warn('Could not set googtrans cookie', e);
  }

  // 2. Look for Google Translate select dropdown element and dispatch change event
  const applyToSelect = () => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      const desiredVal = targetLang === 'en' ? '' : targetLang;
      let matchedIndex = -1;

      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === desiredVal) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== -1) {
        select.selectedIndex = matchedIndex;
      } else if (targetLang === 'en') {
        select.selectedIndex = 0;
      }

      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  };

  if (!applyToSelect()) {
    // Retry shortly in case script is initializing
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (applyToSelect()) {
        clearInterval(interval);
      } else if (attempts >= 8) {
        clearInterval(interval);
        // Fallback: If combo isn't mounted yet, reload so the googtrans cookie automatically translates the whole DOM!
        if (targetLang !== 'en') {
          window.location.reload();
        }
      }
    }, 200);
  }
};

/**
 * Primary function to switch application language
 */
export const changeAppLanguage = (langCode: string) => {
  localStorage.setItem('healthconnect_language', langCode);
  localStorage.setItem('sanjeevani_language', langCode);

  // Update i18next
  i18n.changeLanguage(langCode);

  // Trigger Google Translate engine
  triggerGoogleTranslate(langCode);

  // Dispatch custom window event so any non-react listeners can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('healthconnect-language-change', { detail: { language: langCode } })
    );
  }
};

// If page loaded with a saved non-English language, re-trigger translation once DOM is ready
if (typeof window !== 'undefined' && savedLanguage && savedLanguage !== 'en') {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      triggerGoogleTranslate(savedLanguage);
    }, 400);
  });
}

export default i18n;

