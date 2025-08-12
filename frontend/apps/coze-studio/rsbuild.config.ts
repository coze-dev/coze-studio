/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import path from 'path';

import { defineConfig } from '@coze-arch/rsbuild-config';
import { GLOBAL_ENVS } from '@coze-arch/bot-env';

// 常量定义
const DEFAULT_WEB_SERVER_PORT = 8888;

const API_PROXY_TARGET = `http://localhost:${process.env.WEB_SERVER_PORT || DEFAULT_WEB_SERVER_PORT}/`;

const mergedConfig = defineConfig({
  server: {
    strictPort: true,
    proxy: [
      {
        context: ['/api', '/v1'],
        target: 'http://10.10.10.224:9888/' || API_PROXY_TARGET,
        secure: false,
        changeOrigin: true,
      },
    ],
  },
  html: {
    title: '猎鹰 Studio',
    favicon: './assets/favicon.png',
    template: './index.html',
    crossorigin: 'anonymous',
  },
  tools: {
    postcss: (opts, { addPlugins }) => {
      // Use dynamic import for tailwindcss to support postcss configuration
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- Required for PostCSS plugin configuration
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
      // Arcosite editor sdk internal use
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
      // The following packages contain undegraded ES 2022 syntax (private methods) that need to be packaged
      /\/node_modules\/(marked|@dagrejs|@tanstack)\//,
    ],
    alias: {
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
  performance: {
    chunkSplit: {
      strategy: 'split-by-size',
      minSize: 3_000_000,
      maxSize: 6_000_000,
    },
  },
});

export default mergedConfig;
