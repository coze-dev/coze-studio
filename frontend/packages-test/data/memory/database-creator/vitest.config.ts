import svgr from 'vite-plugin-svgr';
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    plugins: [svgr()],
    dirname: __dirname,
    preset: 'web',
    test: {
      coverage: {
        all: true,
      },
    },
  },
  {
    fixSemi: true,
  },
);
