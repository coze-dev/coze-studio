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

import { type RuleSetRule } from '@rspack/core';

import semiCssVarPrefixPlugin from './semi-css-var-postcss-plugin';
import { IS_DEV_MODE } from './base';

type UseLoaders = Extract<RuleSetRule['use'], unknown[]>;

export const cssLoaders: UseLoaders = [
  'style-loader',
  {
    loader: 'css-loader',
    options: {
      sourceMap: IS_DEV_MODE,
      modules: {
        auto: true,
        exportLocalsConvention: 'camelCase',
        localIdentName: !IS_DEV_MODE ? '[hash]' : '[path][name][ext]__[local]',
      },
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('tailwindcss')(),
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('autoprefixer')(),

          semiCssVarPrefixPlugin(),
        ],
      },
    },
  },
];

/**
 * 已经标记 sideEffects: false，无需覆盖 的pkg:
 * chat-open
 */
export const sideEffectsRules: RuleSetRule[] = [
  {
    test: /packages\/components\/bot-icons/,
    sideEffects: false,
  },
  {
    test: /packages\/components\/bot-semi/,
    sideEffects: false,
  },
  {
    test: /packages\/studio\/chat-area/,
    sideEffects: false,
  },
  {
    test: /packages\/studio\/chat-core/,
    sideEffects: false,
  },
  {
    test: /packages\/arch\/i18n/,
    sideEffects: false,
  },
].filter(r => r);

export const swcTsLoader: UseLoaders = [
  {
    loader: 'builtin:swc-loader',
    options: {
      sourceMap: IS_DEV_MODE,
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
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
        mode: 'usage',
        coreJs: '3.37.1',
        targets: [
          'chrome >= 87',
          'edge >= 88',
          'firefox >= 78',
          'safari >= 14',
        ],
      },
    },
  },
];

export const devCssLoaders: UseLoaders = [
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('tailwindcss')(),
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('autoprefixer')(),

          semiCssVarPrefixPlugin(),
        ],
      },
    },
  },
];
