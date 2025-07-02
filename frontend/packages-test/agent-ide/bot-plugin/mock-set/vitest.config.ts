import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    test: {
      coverage: {
        provider: 'v8',
        all: true,
        include: ['src'],
        exclude: [
          'src/index.tsx',
          'src/hook/table/**',
          'src/global.d.ts',
          'src/typings.d.ts',
          'src/component/**',
          'src/page/**',
          'src/demo/**',
          'src/hook/index.ts',
          'src/util/index.ts',
          'src/util/editor.ts',
          'src/hook/example/**',
        ],
      },
      setupFiles: ['./__tests__/setup.ts'],
    },
  },
  {
    fixSemi: true,
  },
);
