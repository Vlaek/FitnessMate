import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ThemeProvider from './theme-provider';
import { useThemeStore } from '../stores/theme-store';

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    useThemeStore.setState({ currentTheme: 'light' });
  });

  it('applies the dark class to the document root when the stored theme is dark', async () => {
    useThemeStore.setState({ currentTheme: 'dark' });

    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
