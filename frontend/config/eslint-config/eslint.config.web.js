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

const globals = require('globals');

/** @type {(import('eslint').Linter.Config[])} */
module.exports = [
  ...require('./eslint.config.base.js'),
  {
    plugins: {
      // TODO: Need to configure plugins according to different types? You need to read the source code to confirm whether it affects performance
      'react-hooks': require('eslint-plugin-react-hooks'),
      react: require('eslint-plugin-react'),
      risxss: require('eslint-plugin-risxss'),
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        JSX: true,
        React: true,
      },
    },
    settings: {
      // for eslint-plugin-react
      react: {
        pragma: 'React',
        version: '18.2',
      },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'risxss/catch-potential-xss-react': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@douyinfe/semi-ui', '@douyinfe/semi-ui/*'],
              message:
                '请勿直接使用@douyinfe/semi-ui, 请使用 @coze-arch/bot-semi',
            },
            {
              group: ['@douyinfe/semi-ui/lib/es/*'],
              message:
                '如果你的代码为 import { foo } from "@douyinfe/semi-ui/lib/es/bar", 可以尝试替换为 import { foo } from "@coze-arch/bot-semi/Bar"',
            },
            {
              group: ['@edenx/runtime/intl'],
              message:
                '请勿直接使用@edenx/runtime/intl, 请使用 @coze-arch/i18n',
            },
            {
              group: ['@edenx/runtime/router'],
              message:
                '请勿直接使用@edenx/runtime/router, 请使用 react-router-dom',
            },
            {
              group: ['@edenx/runtime/styled'],
              message:
                '请勿直接使用@edenx/runtime/styled, 请使用 styled-components',
            },
          ],
        },
      ],
    },
  },
];
