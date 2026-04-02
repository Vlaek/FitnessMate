import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  initializeLanguage: () => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'ru',

      setLanguage: (lang: string) => {
        set({ currentLanguage: lang });
      },

      initializeLanguage: () => {
        return get().currentLanguage;
      },
    }),
    {
      name: 'language-storage',
    },
  ),
);
