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

import { DotenvPlugin } from 'rspack-plugin-dotenv';
import refreshPlugin from '@rspack/plugin-react-refresh';
import {
  DefinePlugin,
  ProgressPlugin,
  type Configuration,
  HtmlRspackPlugin,
} from '@rspack/core';
import { SemiRspackPlugin } from '@douyinfe/semi-rspack-plugin';
import PkgRootWebpackPlugin from '@coze-arch/pkg-root-webpack-plugin';

import { devCssLoaders, swcTsLoader } from './rules';
import { devDefineEnvs } from './dev';
// eslint-disable-next-line @typescript-eslint/naming-convention -- __dirname
const __rootName = path.resolve(__dirname, '../');

const config: Configuration = {
  mode: 'development',
  context: __rootName,
  entry: {
    main: ['./src/dev-app/index.tsx'],
  },
  experiments: {
    css: true,
  },
  target: ['web'],
  resolve: {
    tsConfigPath: path.resolve(__rootName, 'tsconfig.json'), // https://www.rspack.dev/config/resolve.html#resolvetsconfigpath
    alias: {
      '@coze-arch/i18n$': path.resolve(
        __rootName,
        './node_modules/@coze-arch/i18n/src/raw/index.ts',
      ),
      /**
       * swc.env.mode='usage'
       */
      'core-js': path.dirname(require.resolve('core-js')),
    },
    extensions: ['...', '.tsx', '.ts', '.jsx'],
  },
  module: {
    parser: {
      'css/auto': {
        namedExports: false,
      },
    },
    generator: {
      'css/auto': {
        exportsConvention: 'camel-case',
        localIdentName: '[hash]-[local]',
      },
    },
    rules: [
      {
        test: /\.less$/,
        use: [
          ...devCssLoaders,
          {
            loader: 'less-loader',
            options: {},
          },
        ],
        type: 'css/auto',
      },
      {
        test: /\.scss$/,
        use: [
          ...devCssLoaders,
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                silenceDeprecations: [
                  'mixed-decls',
                  'import',
                  'function-units',
                ],
              },
            },
          },
        ],
        type: 'css/auto',
      },
      {
        test: /\.css$/,
        use: devCssLoaders,
      },
      {
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              native: false,
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          },
          'file-loader',
        ],
      },
      {
        test: /\.(png|gif|jpg|jpeg|woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.tsx?$/,
        exclude: {
          and: [/\/node_modules\//, /^((?!@byted\/mojito-safe-fund).)*$/],
        },
        use: swcTsLoader,
      },
    ],
  },
  builtins: {
    treeShaking: true,
  },
  plugins: [
    new DotenvPlugin({
      path: path.resolve(
        __rootName,
        devDefineEnvs.IS_BOE ? '.env.local.boe' : '.env.local',
      ),
      systemvars: false,
      defaults: true,
      allowEmptyValues: true,
    }),
    new DefinePlugin({
      ...devDefineEnvs,
      IS_PROD: !devDefineEnvs.IS_BOE,
    }),
    new ProgressPlugin({}),
    new PkgRootWebpackPlugin({}),
    new SemiRspackPlugin({
      prefixCls: 'coze-chat-sdk-semi',
    }),
    new HtmlRspackPlugin(),
    new refreshPlugin(),
  ] as Configuration['plugins'],
  stats: false,
  devServer: {
    allowedHosts: 'all',
    compress: false,
    historyApiFallback: true,
    port: '8081',
    hot: true,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:8888',
        secure: false,
        changeOrigin: true,
      },
      {
        context: ['/v1'],
        target: 'http://localhost:8888',
        secure: false,
        changeOrigin: true,
      },
      {
        context: ['/v3'],
        target: 'http://localhost:8888',
        secure: false,
        changeOrigin: true,
      },
    ],
  },
};

export default config;
