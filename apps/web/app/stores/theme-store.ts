import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface IThemeState {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => Theme;
}

export const useThemeStore = create<IThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'light',
      setTheme: (theme) => {
        set({ currentTheme: theme });
      },
      initializeTheme: () => {
        return get().currentTheme;
      },
    }),
    {
      name: 'theme-storage',
    },
  ),
);
