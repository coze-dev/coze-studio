import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      all: true,
      exclude: ['src/index.ts'],
    },
  },
  plugins: [
    {
      name: 'edenx-virtual-modules',
      enforce: 'pre',
    },
  ],
});
