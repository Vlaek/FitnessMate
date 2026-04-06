import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../stores/language-store';

export function MainHeader() {
  const { t, i18n } = useTranslation('common');
  const { setLanguage, initializeLanguage } = useLanguageStore();
  const [isMounted, setIsMounted] = useState(false);

  const currentLanguage = initializeLanguage();

  const changeLanguage = (lng: string) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguageName = () => {
    switch (currentLanguage) {
      case 'en':
        return t('english') || 'English';
      case 'de':
        return t('german') || 'Deutsch';
      case 'ru':
        return t('russian') || 'Русский';
      default:
        return t('language') || 'Language';
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="mb-12 text-center">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/analytics">
            <Button variant="ghost">{t('workoutAnalytics')}</Button>
          </Link>
        </div>
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            {isMounted ? t('fitnessmate') : 'FitnessMate'}
          </h1>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-24">
                {isMounted ? getCurrentLanguageName() : 'Language'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                {t('english') || 'English'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('de')}>
                {t('german') || 'Deutsch'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('ru')}>
                {t('russian') || 'Русский'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}