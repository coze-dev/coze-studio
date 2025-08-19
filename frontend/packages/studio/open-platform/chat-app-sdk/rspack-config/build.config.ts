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

import { DefinePlugin, ProgressPlugin, type Configuration } from '@rspack/core';
import { SemiRspackPlugin } from '@douyinfe/semi-rspack-plugin';
import PkgRootWebpackPlugin from '@coze-arch/pkg-root-webpack-plugin';

import { PREFIX_CLASS } from './semi-css-var-postcss-plugin';
import { cssLoaders, sideEffectsRules, swcTsLoader } from './rules';
import { openSdkUnPkgDirName } from './env';
import { IS_ANALYZE_MODE } from './base';
import { getRspackAppDefineEnvs } from './app';
// eslint-disable-next-line @typescript-eslint/naming-convention -- __dirname
const __rootName = path.resolve(__dirname, '../');

const config: Configuration = {
  mode: 'production',
  context: __rootName,
  optimization: {
    splitChunks: false,
    ...(IS_ANALYZE_MODE
      ? {
          minimize: false,
          chunkIds: 'named',
        }
      : {}),
  },
  entry: {
    main: ['./src/index.ts'],
    ui: './src/export-ui/index.ts',
  },
  experiments: {
    css: false,
  },
  output: {
    path: openSdkUnPkgDirName,
    filename: pathData =>
      pathData.chunk?.name === 'main' ? 'index.js' : '[name].js',
    library: {
      name: 'CozeWebSDK[name]',
      type: 'umd',
    },
  },
  target: ['web'],
  resolve: {
    tsConfigPath: path.resolve(__rootName, './tsconfig.json'), // https://www.rspack.dev/config/resolve.html#resolvetsconfigpath
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
    rules: [
      ...sideEffectsRules,
      {
        test: /\.svg$/,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
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
              native: false,
            },
          },
          'file-loader',
        ],
      },
      {
        test: /\.(png|gif|jpg|jpeg|woff2)$/,
        type: 'asset',
      },
      {
        test: /\.less$/,
        use: [
          ...cssLoaders,
          {
            loader: 'less-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          ...cssLoaders,
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
      },
      {
        test: /\.css$/,
        use: cssLoaders,
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
    new DefinePlugin(getRspackAppDefineEnvs()),
    new ProgressPlugin({}),
    new PkgRootWebpackPlugin({}),
    new SemiRspackPlugin({
      prefixCls: PREFIX_CLASS,
    }),
  ].filter(Boolean) as Configuration['plugins'],
  devServer: {
    allowedHosts: 'all',
    historyApiFallback: true,
    hot: true,
  },
  devtool: false,
};

export default config;
