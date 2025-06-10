import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    test: {
      coverage: {
        exclude: ['**/*.stories.tsx', '**/colors/*.tsx', '**/colors/*.ts'],
      },
    },
  },
  {
    fixSemi: true,
  },
);
