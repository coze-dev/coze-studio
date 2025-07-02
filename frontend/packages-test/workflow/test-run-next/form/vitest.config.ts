import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    test: {
      setupFiles: ['./__tests__/setup.tsx'],
    },
  },
  {
    fixSemi: true,
  },
);
