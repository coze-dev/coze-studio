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

const importPlugin = require('eslint-plugin-import');

/** @type {(import('eslint').Linter.Config)[]} */
module.exports = [
  {
    files: ['**/*.?(m|c)?(j|t)s?(x)'],
    settings: {
      // TODO: Keep a configuration globally
      'import/resolver': {
        node: {
          moduleDirectory: ['node_modules', 'src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
      'import/no-relative-packages': 'error',
      'import/extensions': 'off',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            ['internal', 'parent', 'sibling', 'index'],
            'unknown',
          ],
          pathGroups: [
            {
              pattern: 'react*',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: './*.+(css|sass|less|scss|pcss|styl)',
              patternOptions: { dot: true, nocomment: true },
              group: 'unknown',
              position: 'after',
            },
          ],
          alphabetize: {
            order:
              'desc' /* sort in ascending order. Options: ['ignore', 'asc', 'desc'] */,
            caseInsensitive: true /* ignore case. Options: [true, false] */,
          },
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['**/*.?(m|c)ts?(x)'],
    ...importPlugin.configs.typescript,
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // TODO: At present, because edenx will dynamically generate some plug-in modules, an error will be reported when starting.
      // You need to fix the problem later, and start the following rules.
      // "import/no-unresolved": "error"
    },
  },
];
