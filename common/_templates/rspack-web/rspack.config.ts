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

import refreshPlugin from '@rspack/plugin-react-refresh';
import rspack from '@rspack/core';
import { type Configuration } from '@rspack/cli';

import { updateDTS } from './env/scripts/index';
import { envs } from './env';

const { IS_DEV_MODE, IS_CI, IS_SCM } = envs;

const CDN_PATH = IS_SCM
  ? `//${process.env.CDN_INNER_CN}/${process.env.CDN_PATH_PREFIX}`
  : '/';

if (IS_DEV_MODE) {
  updateDTS();
}

const config: Configuration = {
  mode: IS_DEV_MODE ? 'development' : 'production',
  context: __dirname,
  entry: { main: './src/index.tsx' },
  output: { path: 'output', publicPath: CDN_PATH },
  target: ['web'],
  resolve: {
    tsConfigPath: path.resolve(__dirname, 'tsconfig.json'), // https://www.rspack.dev/config/resolve.html#resolvetsconfigpath
  },
  devServer: {
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: [
          { loader: '@svgr/webpack', options: { native: false } },
          'file-loader',
        ],
      },
      {
        test: /\.(png|gif|jpg|jpeg|woff2)$/,
        use: ['file-loader'],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: {
                  tailwindcss: {},
                  autoprefixer: {},
                },
              },
            },
          },
        ],
        type: 'css',
      },
      {
        test: /\.module\.css$/i,
        type: 'css/module',
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'less-loader',
          },
        ],
        type: 'css/auto',
      },
      {
        test: /\.(jsx?|tsx?)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: IS_DEV_MODE,
                    refresh: IS_DEV_MODE,
                  },
                },
              },
              env: {
                targets: [
                  'chrome >= 87',
                  'edge >= 88',
                  'firefox >= 78',
                  'safari >= 14',
                ],
              },
            },
          },
        ],
      },
    ],
  },
  builtins: {
    treeShaking: !IS_DEV_MODE && !IS_CI,
  },
  plugins: [
    new rspack.DefinePlugin({
      ...envs,
    }),
    new rspack.ProgressPlugin({}),
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    IS_DEV_MODE ? new refreshPlugin() : null,
    IS_DEV_MODE && new rspack.ProgressPlugin(),
  ].filter(Boolean),
  /** module is too large now, we may need better way to tackle this in the future */
  stats: IS_DEV_MODE
    ? false
    : IS_CI
    ? {
        all: false,
        modules: true,
        assets: true,
        chunks: true,
        warnings: true,
        errors: true,
      }
    : {
        modules: false,
        all: false,
        warnings: false,
        errors: true,
        timings: true,
      },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      minSize: 20000,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

export default config;
