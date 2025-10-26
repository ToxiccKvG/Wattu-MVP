
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend) // Load translations from /public/locales
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    fallbackLng: 'fr', // Default language
    supportedLngs: ['fr', 'wo'], // French and Wolof
    
    debug: false, // Set to true for development debugging
    
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
    
    detection: {
      order: ['localStorage', 'navigator'], // Check localStorage first, then browser
      caches: ['localStorage'], // Save language preference
      lookupLocalStorage: 'wattu_language', // Key for localStorage
    },
    
    ns: ['common', 'citizen', 'agent', 'admin', 'errors'], // Namespaces
    defaultNS: 'common', // Default namespace
    
    react: {
      useSuspense: true, // Enable suspense for translations loading
    },
  });

export default i18n;

