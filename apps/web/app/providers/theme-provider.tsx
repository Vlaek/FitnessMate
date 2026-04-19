'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../stores/theme-store';

interface IProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: IProps) {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    const theme = currentTheme || initializeTheme();

    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
  }, [currentTheme, initializeTheme]);

  return <>{children}</>;
}
