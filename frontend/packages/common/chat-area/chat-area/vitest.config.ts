import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    coverage: {
      all: true,
      include: ['src'],
      exclude: ['src/index.ts', 'src/typings.d.ts'],
    },
  },
});
