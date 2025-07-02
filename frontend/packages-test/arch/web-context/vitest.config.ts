// FIXME: Unable to resolve path to module 'vitest/config'

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    mockReset: false,
    coverage: {
      provider: 'v8',
      reporter: ['cobertura', 'text', 'html', 'clover', 'json'],
      exclude: ['src/const', '.eslintrc.js', 'src/index.ts'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
  },
});
