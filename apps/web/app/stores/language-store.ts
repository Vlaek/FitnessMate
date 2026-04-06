import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ILanguageState {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  initializeLanguage: () => string;
}

export const useLanguageStore = create<ILanguageState>()(
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
