import svgr from 'vite-plugin-svgr';
import { defineConfig } from '@coze-arch/vitest-config';

export default defineConfig({
  dirname: __dirname,
  preset: 'web',
  plugins: [
    // @ts-expect-error Incompatible svgr types
    svgr({
      include: ['**/*.svg'],
    }),
  ],
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'happy-dom',
    server: {
      deps: {
        inline: ['@coze-arch/coze-design', 'lottie-web'],
      },
    },
  },
  define: {
    'import.meta.vitest': undefined,
  },
});
