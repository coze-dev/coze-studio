import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    dirname: __dirname,
    preset: 'web',
    test: {
      setupFiles: ['./setup'],
      includeSource: ['./src'],
      coverage: {
        all: true,
        include: ['src'],
        exclude: ['src/index.ts', 'src/global.d.ts', 'src/page-jump/config.ts'],
      },
    },
  },
  {
    fixSemi: true,
  },
);
