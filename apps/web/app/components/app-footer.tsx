'use client';

import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AppFooter() {
  const { t } = useTranslation('common');

  return (
    <footer
      data-testid="app-footer"
      className="h-[60px] border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
    >
      <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-semibold text-foreground">FitnessMate</span> {t('footerDescription')}
        </p>

        <a
          href="https://github.com/Vlaek"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
          aria-label={t('footerGithubAria')}
        >
          <Github className="h-4 w-4" />
          <span>github.com/Vlaek</span>
        </a>
      </div>
    </footer>
  );
}
