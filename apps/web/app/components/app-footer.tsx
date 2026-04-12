 'use client';

import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AppFooter() {
  const { t } = useTranslation('common');

  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-semibold text-slate-800">FitnessMate</span>{' '}
          {t('footerDescription')}
        </p>

        <a
          href="https://github.com/Vlaek"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-slate-700 transition-colors hover:text-slate-900"
          aria-label={t('footerGithubAria')}
        >
          <Github className="h-4 w-4" />
          <span>github.com/Vlaek</span>
        </a>
      </div>
    </footer>
  );
}
