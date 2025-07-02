import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      all: true,
    },
  },
});
