import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  test: {
    // 全局测试超时时间（毫秒）
    testTimeout: 10000, // 10秒
    // Hook 超时时间（毫秒）
    hookTimeout: 10000, // 10秒
  },
});
