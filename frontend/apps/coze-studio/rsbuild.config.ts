import path from 'path';

import { defineConfig } from '@coze-arch/rsbuild-config';
import { GLOBAL_ENVS } from '@coze-arch/bot-env';

const mergedConfig = defineConfig({
  server: {
    strictPort: true,
  },
  html: {
    title: '扣子 Studio',
    favicon: './assets/favicon.png',
    template: './index.html',
    crossorigin: 'anonymous',
  },
  tools: {
    postcss: (opts, { addPlugins }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      addPlugins([require('tailwindcss')('./tailwind.config.ts')]);
    },
    rspack(config, { appendPlugins, addRules, mergeConfig }) {
      addRules([
        {
          test: /\.(css|less|jsx|tsx|ts|js)/,
          exclude: [
            new RegExp('apps/coze-studio/src/index.css'),
            /node_modules/,
            new RegExp('packages/arch/i18n'),
          ],
          use: '@coze-arch/import-watch-loader',
        },
      ]);

      return mergeConfig(config, {
        module: {
          parser: {
            javascript: {
              exportsPresence: false,
            },
          },
        },
        devServer: {
          proxy: [
            // {
            //   context: ['/api'],
            //   target: 'http://localhost:8888',
            // },
          ],
        },
        resolve: {
          fallback: {
            path: require.resolve('path-browserify'),
          },
        },
        watchOptions: {
          poll: true,
        },
        ignoreWarnings: [
          /Critical dependency: the request of a dependency is an expression/,
          warning => true,
        ],
      });
    },
  },
  source: {
    define: {
      'process.env.IS_REACT18': JSON.stringify(true),
      // arcosite editor sdk 内部使用
      'process.env.ARCOSITE_SDK_REGION': JSON.stringify(
        GLOBAL_ENVS.IS_OVERSEA ? 'VA' : 'CN',
      ),
      'process.env.ARCOSITE_SDK_SCOPE': JSON.stringify(
        GLOBAL_ENVS.IS_RELEASE_VERSION ? 'PUBLIC' : 'INSIDE',
      ),
      'process.env.TARO_PLATFORM': JSON.stringify('web'),
      'process.env.SUPPORT_TARO_POLYFILL': JSON.stringify('disabled'),
      'process.env.RUNTIME_ENTRY': JSON.stringify('@coze-dev/runtime'),
      'process.env.TARO_ENV': JSON.stringify('h5'),
      ENABLE_COVERAGE: JSON.stringify(false),
    },
    include: [
      path.resolve(__dirname, '../../packages'),
      path.resolve(__dirname, '../../infra/flags-devtool'),
      // 以下几个包包含未降级的 ES 2022 语法（private methods）需要参与打包
      /\/node_modules\/(marked|@dagrejs|@tanstack)\//,
    ],
    alias: {
      // TODO: fixme late，开源之前需要干掉这个
      '@slardar/web/client': '@slardar/web/cn',
      '@coze-arch/foundation-sdk': require.resolve(
        '@coze-foundation/foundation-sdk',
      ),
      'react-router-dom': require.resolve('react-router-dom'),
    },
    /**
     * support inversify @injectable() and @inject decorators
     */
    decorators: {
      version: 'legacy',
    },
  },
});

export default mergedConfig;
