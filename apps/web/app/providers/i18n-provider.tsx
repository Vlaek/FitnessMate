'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18nConfig from '../../i18n/i18n-config';
import { useLanguageStore } from '../stores/language-store';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { initializeLanguage } = useLanguageStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialLanguage = initializeLanguage();

    if (!i18nConfig.isInitialized) {
      i18nConfig
        .init({
          lng: initialLanguage,
          fallbackLng: 'en',
          debug: process.env.NODE_ENV !== 'production',

          defaultNS: 'common',
          ns: ['common'],

          interpolation: {
            escapeValue: false,
          },

          backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
          },
        })
        .then(() => {
          setInitialized(true);
        });
    } else {
      i18nConfig.changeLanguage(initialLanguage);
      setInitialized(true);
    }
  }, [initializeLanguage]);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  return <I18nextProvider i18n={i18nConfig}>{children}</I18nextProvider>;
}
