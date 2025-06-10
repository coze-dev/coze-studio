// FIXME: Unable to resolve path to module 'vitest/config'
import { defaultExclude } from 'vitest/config';
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  preset: 'node',
  dirname: __dirname,
  test: {
    globals: true,
    mockReset: false,
    coverage: {
      provider: 'v8',
      exclude: ['.eslintrc.js', 'lib', ...defaultExclude],
    },
  },
});
