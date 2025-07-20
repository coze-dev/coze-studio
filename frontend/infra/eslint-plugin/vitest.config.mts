import { defineConfig, coverageConfigDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30 * 1000,
    coverage: {
      provider: 'v8',
      all: true,
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/index.js',
        'src/index.ts',
        'src/zustand/index.js',
        'src/zustand/index.ts',
      ],
      reporter: ['cobertura', 'text', 'html', 'clover', 'json', 'json-summary'],
    },
  },
});
