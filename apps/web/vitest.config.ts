import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxDev: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname),
      '@repo/ui/components': path.resolve(dirname, '../../packages/ui/src/components'),
      '@repo/ui/hooks': path.resolve(dirname, '../../packages/ui/src/hooks'),
      '@repo/ui/lib': path.resolve(dirname, '../../packages/ui/src/lib'),
      '@repo/ui/toast': path.resolve(dirname, '../../packages/ui/src/toast.ts'),
      '@repo/ui': path.resolve(dirname, '../../packages/ui'),
    },
  },
});
