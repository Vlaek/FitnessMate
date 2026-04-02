import baseConfig from '@repo/eslint-config/base';
import { defineConfig } from 'eslint/config';

export default defineConfig([baseConfig, { rules: { 'react-refresh/only-export-components': 0 } }]);
