import { defaultExclude } from 'vitest/config';
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    exclude: [...defaultExclude, 'src/auto-generate'],
    coverage: {
      all: false,
      include: ['src/axios.ts'],
    },
  },
});
