import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig(
  {
    plugins: [],
    dirname: __dirname,
    preset: 'web',
    ssr: {
      noExternal: ['@coze-arch/coze-design', '@douyinfe/semi-ui'],
    },
  },
  {
    fixSemi: true,
  },
);
