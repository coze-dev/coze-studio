import { resolve } from 'path';

import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    test: {
      setupFiles: ['src/__tests__/setup-vitest.ts'],
      alias: {
        '@byted-sami/speech-sdk': resolve('src/__mocks__/speeck-sdk.ts'),
      },
      coverage: {
        provider: 'v8',
        reporter: ['cobertura', 'text', 'html', 'clover', 'json'],
        exclude: ['stories'],
        include: ['src'],
      },
    },
  },
  {
    fixSemi: true,
  },
);
