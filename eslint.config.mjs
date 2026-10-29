import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import legacyConfig from './.eslintrc.cjs';

const compat = new FlatCompat({
  baseDirectory: fileURLToPath(new URL('.', import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [{ ignores: ['.tmp/**', '.serena/**', 'dist/**', 'dist-ssr/**'] }, ...compat.config(legacyConfig)];
