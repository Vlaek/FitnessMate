import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../stores/language-store';

export function MainHeader() {
  const { t, i18n } = useTranslation('common');
  const { setLanguage, initializeLanguage } = useLanguageStore();

  // Get the current language from the store
  const currentLanguage = initializeLanguage();

  const changeLanguage = (lng: string) => {
    // Update the store
    setLanguage(lng);
    // Change the i18n language
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

  return (
    <header className="mb-12 text-center">
      <div className="mb-4 flex items-center justify-between">
        <div></div>
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
            {t('fitnessmate')}
          </h1>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-24">
                {getCurrentLanguageName()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-24">
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
      <p className="mx-auto max-w-3xl text-xl text-slate-600">
        {t('trackYourWorkoutsAndShareResultsViaTelegram')}
      </p>
    </header>
  );
}
