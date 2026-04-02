import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TelegramState {
  token: string;
  chatId: string;
  setToken: (token: string) => void;
  setChatId: (chatId: string) => void;
  resetToken: () => void;
  isConfigured: () => boolean;
}

export const useTelegramStore = create<TelegramState>()(
  persist(
    (set, get) => ({
      token: '',
      chatId: '',
      setToken: (token) => set({ token }),
      setChatId: (chatId) => set({ chatId }),
      resetToken: () => set({ token: '', chatId: '' }),
      isConfigured: () => !!get().token,
    }),
    {
      name: 'telegram-storage',
    },
  ),
);
