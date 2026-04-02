'use client';

import { useEffect } from 'react';
import i18nConfig from '../../i18n/i18n-config';
import { I18nextProvider } from 'react-i18next';
import { useLanguageStore } from '../stores/language-store';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { initializeLanguage } = useLanguageStore();

  useEffect(() => {
    // Get the initial language from the store
    const initialLanguage = initializeLanguage();
    
    // Initialize i18next on the client side
    if (!i18nConfig.isInitialized) {
      i18nConfig.init({
        lng: initialLanguage,
        fallbackLng: 'en',
        debug: process.env.NODE_ENV !== 'production',
        
        interpolation: {
          escapeValue: false, // react already safes from xss
        },
        
        backend: {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      });
    } else {
      // If i18next is already initialized, just change the language
      i18nConfig.changeLanguage(initialLanguage);
    }
  }, [initializeLanguage]);

  return <I18nextProvider i18n={i18nConfig}>{children}</I18nextProvider>;
}