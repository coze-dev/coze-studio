import { mergeConfig } from 'vitest/config';
import { defineConfig } from '@coze-arch/vitest-config';

export default mergeConfig(
  defineConfig({
    dirname: __dirname,
    preset: 'web',
  }),
  {
    test: {
      setupFiles: ['./__tests__/setup.ts'],
    },
  },
);
