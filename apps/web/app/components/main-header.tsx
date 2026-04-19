import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../stores/language-store';
import { useThemeStore } from '../stores/theme-store';

export function MainHeader() {
  const { t, i18n } = useTranslation('common');
  const { setLanguage, initializeLanguage } = useLanguageStore();
  const { setTheme, initializeTheme } = useThemeStore();
  const [isMounted, setIsMounted] = useState(false);

  const currentLanguage = initializeLanguage();
  const currentTheme = initializeTheme();

  const changeLanguage = (lng: string) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const getCurrentLanguageName = () => {
    switch (currentLanguage) {
      case 'en':
        return t('english') || 'English';
      case 'de':
        return t('german') || 'Deutsch';
      case 'ru':
        return t('russian') || 'Russian';
      default:
        return t('language') || 'Language';
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="mb-12 text-center">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <Link href="/analytics">
            <Button variant="ghost">{t('workoutAnalytics')}</Button>
          </Link>
        </div>
        <div>
          <h1 className="text-foreground text-5xl font-extrabold tracking-tight">
            {isMounted ? t('fitnessmate') : 'FitnessMate'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              isMounted && currentTheme === 'light'
                ? t('switchToDarkTheme')
                : t('switchToLightTheme')
            }
          >
            {isMounted && currentTheme === 'dark' ? (
              <Sun className="h-5 w-5 text-black" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
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
                {t('russian') || 'Russian'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}