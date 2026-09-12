import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import hi from './hi.json';
import gu from './gu.json';

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * HealthConnect Supported Native Languages
 * Verified with complete healthcare dictionaries and 100% key parity.
 */
export const supportedLanguages: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

const VALID_CODES = supportedLanguages.map((l) => l.code);

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  const saved =
    localStorage.getItem('healthconnect_language') ||
    localStorage.getItem('sanjeevani_language') ||
    'en';
  return VALID_CODES.includes(saved) ? saved : 'en';
};

const savedLanguage = getInitialLanguage();

/**
 * Aggressively purge any stale Google Translate cookies if previously set in the browser session
 */
export const purgeLegacyGoogleTranslateCookies = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const host = window.location.hostname;
    const cookieNames = ['googtrans', 'googtrans_opt', 'goog_pem_opt'];
    const domains = ['', `domain=${host};`, `domain=.${host};`];
    const paths = ['path=/;', 'path=/patient;', 'path=/district;'];

    cookieNames.forEach((name) => {
      domains.forEach((dom) => {
        paths.forEach((p) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${p} ${dom}`;
          document.cookie = `${name}=; Max-Age=-99999999; ${p} ${dom}`;
        });
      });
    });
  } catch {
    // Ignore cookie clearance errors in restricted browser sandboxes
  }
};

// Immediate cleanup on module load
purgeLegacyGoogleTranslateCookies();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Configure document-level language attributes and guarantee browser auto-translation is disabled
if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLanguage;
  document.documentElement.setAttribute('translate', 'no');
}

// Development warning for missing translation keys
if (import.meta.env?.DEV) {
  i18n.on('missingKey', (lngs, namespace, key) => {
    console.warn(
      `[HealthConnect i18n] Missing key: "${key}" for language: ${Array.isArray(lngs) ? lngs.join(', ') : lngs}`
    );
  });
}

/**
 * Primary function to switch application language natively across React components.
 * Updates i18n instance, persists preference in localStorage, and updates document attributes.
 */
export const changeAppLanguage = (langCode: string) => {
  const validCode = VALID_CODES.includes(langCode) ? langCode : 'en';
  localStorage.setItem('healthconnect_language', validCode);
  localStorage.setItem('sanjeevani_language', validCode);

  // Update i18next language reactively
  i18n.changeLanguage(validCode);

  // Keep document html lang and translate="no" synchronized for a11y & browser protection
  if (typeof document !== 'undefined') {
    document.documentElement.lang = validCode;
    document.documentElement.setAttribute('translate', 'no');
  }

  // Ensure no stale Google translation cookies linger
  purgeLegacyGoogleTranslateCookies();

  // Dispatch custom window event so listeners can update immediate state
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('healthconnect-language-change', { detail: { language: validCode } })
    );
  }
};

export default i18n;



