import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18/en/ui.json';
import sv from './i18/sv/ui.json';

// Optionally, load more namespaces if you have them
// import enLabel from './i18/en/label.json';
// import svLabel from './i18/sv/label.json';

// Add more namespaces as needed

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sv: { translation: sv },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: {
      useSuspense: false
    }
  });

export default i18n;
