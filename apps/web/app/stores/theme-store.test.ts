import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ currentTheme: 'light' });
  });

  it('stores the selected theme and exposes it through initializeTheme', () => {
    useThemeStore.getState().setTheme('dark');

    expect(useThemeStore.getState().initializeTheme()).toBe('dark');
  });
});
