# Dark Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent dark theme toggle next to the language switcher without changing the current light theme appearance.

**Architecture:** Mirror the existing language persistence pattern with a dedicated zustand theme store and a small provider that syncs the stored theme to the document root. Reuse the existing design tokens in `packages/ui/src/styles/globals.css`, then replace hard-coded light-only utility classes in the main shell with token-based classes so the dark palette applies cleanly.

**Tech Stack:** Next.js App Router, React 19, Zustand persist, Tailwind v4 tokens, Vitest, React Testing Library

---

### Task 1: Add Theme State Tests and Infrastructure

**Files:**
- Modify: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\package.json`
- Create: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\vitest.config.ts`
- Create: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\vitest.setup.ts`
- Create: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\app\stores\theme-store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @repo/web exec vitest run app/stores/theme-store.test.ts`
Expected: FAIL because `./theme-store` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IThemeState {
  currentTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  initializeTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<IThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'light',
      setTheme: (theme) => set({ currentTheme: theme }),
      initializeTheme: () => get().currentTheme,
    }),
    { name: 'theme-storage' },
  ),
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @repo/web exec vitest run app/stores/theme-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/vitest.config.ts apps/web/vitest.setup.ts apps/web/app/stores/theme-store.test.ts apps/web/app/stores/theme-store.ts
git commit -m "test: add theme store coverage"
```

### Task 2: Add Provider and Header Theme Toggle

**Files:**
- Create: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\app\providers\theme-provider.tsx`
- Modify: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\app\layout.tsx`
- Modify: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\app\components\main-header.tsx`
- Test: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\app\components\main-header.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainHeader } from './main-header';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

describe('MainHeader', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders a theme switcher next to the language switcher', async () => {
    render(<MainHeader />);

    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @repo/web exec vitest run app/components/main-header.test.tsx`
Expected: FAIL because there is no theme trigger yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
<div className="flex items-center justify-end gap-2">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="w-24">
        {isMounted ? getCurrentThemeName() : 'Theme'}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => changeTheme('light')}>Light</DropdownMenuItem>
      <DropdownMenuItem onClick={() => changeTheme('dark')}>Dark</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  <DropdownMenu>{/* existing language switcher */}</DropdownMenu>
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @repo/web exec vitest run app/components/main-header.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/providers/theme-provider.tsx apps/web/app/layout.tsx apps/web/app/components/main-header.tsx apps/web/app/components/main-header.test.tsx
git commit -m "feat: add persistent theme toggle"
```

### Task 3: Apply Theme Tokens to the Main Shell

**Files:**
- Modify: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\app\page.tsx`
- Modify: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\apps\web\app\components\main-header.tsx`
- Inspect: `C:\Users\Vlad\Desktop\FitnessMate\my-turborepo\packages\ui\src\styles\globals.css`

- [ ] **Step 1: Write the failing test**

```tsx
it('uses theme tokens for the page shell and header title', () => {
  render(<HomePage />);

  expect(screen.getByTestId('home-shell')).toHaveClass('bg-background');
  expect(screen.getByTestId('main-title')).toHaveClass('text-foreground');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @repo/web exec vitest run app/page.test.tsx`
Expected: FAIL because the page still uses `bg-slate-50` and `text-slate-900`.

- [ ] **Step 3: Write minimal implementation**

```tsx
<div
  data-testid="home-shell"
  className="min-h-[calc(100vh-62px)] bg-background py-8 transition-colors"
>
```

```tsx
<h1 data-testid="main-title" className="text-5xl font-extrabold tracking-tight text-foreground">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @repo/web exec vitest run app/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/page.tsx apps/web/app/components/main-header.tsx apps/web/app/page.test.tsx
git commit -m "style: align app shell with theme tokens"
```
