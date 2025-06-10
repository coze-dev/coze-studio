import path from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    plugins: [
      tsconfigPaths({
        projects: [
          './tsconfig.json',
          `${path.relative(
            __dirname,
            path.dirname(require.resolve('@coze/coze-design/package.json')),
          )}/tsconfig.build.json`,
        ],
      }),
    ],
    dirname: __dirname,
    preset: 'web',
  },
  {
    fixSemi: true,
  },
);
