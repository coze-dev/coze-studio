import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    setupFiles: ['./setup'],
    coverage: {
      exclude: ['src/index.ts', 'src/types.ts', 'src/feature-flags.ts'],
      all: true,
    },
  },
});
