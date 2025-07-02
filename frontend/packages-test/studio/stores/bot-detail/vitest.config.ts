import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    setupFiles: ['./__mocks__/setup-vitest.ts'],
    coverage: {
      all: true,
      provider: 'v8',
      include: ['src/store/*'],
      exclude: ['src/store/**/**/transform.ts'],
    },
  },
});
