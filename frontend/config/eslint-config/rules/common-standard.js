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

const path = require('path');
const fs = require('fs');

const JSON5 = require('json5');

const noRestrictedSyntaxRule = [
  'error',
  {
    selector: 'LabeledStatement',
    message:
      'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
  },
  {
    selector: 'WithStatement',
    message:
      '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
  },
];

const readBlockList = () =>
  JSON5.parse(
    fs.readFileSync(
      // fixme @fanwenjie.fe
      path.resolve(__dirname, '../../../disallowed_3rd_libraries.json'),
      'utf-8',
    ),
  );

/** @type {(import('eslint').Linter.Config)[]} */
module.exports = [
  // NOTE: Cannot be merged with the next configuration
  {
    ignores: [
      '**/*.d.ts',
      '**/.storybook/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/build/**',
      '**/__dist__/**',
      '**/dist/**',
      '**/es/**',
      '**/lib/**',
      '**/.codebase/**',
      '**/.github/**',
      '**/.changeset/**',
      '**/config/**',
      '**/common/scripts/**',
      '**/output/**',
      '**/output_resource/**',
      '**/__tests__/fixtures/**',
      '**/__tests__/outputs/**',
      'error-log-str.js',
      '*.bundle.js',
      '*.min.js',
      '*.js.map',
      '**/*.log',
      '**/tsconfig.tsbuildinfo',
      '**/.jscpd',
    ],
  },
  {
    plugins: {
      '@coze-arch': require('@coze-arch/eslint-plugin'),
      '@coze-arch/zustand': require('@coze-arch/eslint-plugin/zustand'),
    },
  },
  ...require('@coze-arch/eslint-plugin').configs.recommended,
  require('@coze-arch/eslint-plugin/zustand').configs.recommended,
  {
    files: ['**/*.?(m|c)?(j|t)s?(x)'], // Exclusion rules take effect for package.json
    plugins: {
      prettier: require('eslint-plugin-prettier'),
      '@babel': require('@babel/eslint-plugin'),
      import: require('eslint-plugin-import'),
      unicorn: require('eslint-plugin-unicorn'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      '@stylistic/ts': require('@stylistic/eslint-plugin-ts'),
      'eslint-comments': require('eslint-plugin-eslint-comments'),
    },
    rules: {
      '@coze-arch/package-disallow-deps': ['error', readBlockList()],
      'no-restricted-syntax': noRestrictedSyntaxRule,
      'prettier/prettier': [
        'warn',
        require('../.prettierrc'),
        { usePrettierrc: false },
      ],
      'no-empty': 'error',
      'import/no-duplicates': 'error',
      'unicorn/no-static-only-class': 'error',
      curly: 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'max-statements-per-line': 'error',
      'rest-spread-spacing': 'error',
      'max-len': [
        'warn',
        {
          code: 120,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
        },
      ],
      'no-unexpected-multiline': 'error',
      'no-irregular-whitespace': [
        'error',
        {
          skipStrings: true,
          skipComments: true,
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-inner-declarations': ['error', 'both'],
      'no-self-assign': 'error',
      'prefer-destructuring': [
        'warn',
        {
          object: true,
          array: false,
        },
      ],
      'no-sparse-arrays': 'error',
      'no-new-object': 'error',
      'object-shorthand': 'error',
      'no-empty-pattern': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-class-assign': 'error',
      'arrow-body-style': 'error',
      'no-async-promise-executor': 'error',
      'prefer-promise-reject-errors': 'error',
      // TODO: complexity is stricter after we updated to eslint 9.
      complexity: ['warn', 15],
      'max-params': [
        'error',
        {
          max: 3,
        },
      ],
      'no-extra-bind': 'error',
      'no-prototype-builtins': 'error',
      'new-parens': 'error',
      'prefer-template': 'warn',
      'no-multi-str': 'error',
      'use-isnan': 'error',
      'no-floating-decimal': 'error',
      'guard-for-in': 'warn',
      'for-direction': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unsafe-finally': 'error',
      'no-cond-assign': ['error', 'always'],
      'no-constant-condition': [
        'error',
        {
          checkLoops: false,
        },
      ],
      'no-dupe-else-if': 'error',
      'no-extra-boolean-cast': [
        'error',
        {
          enforceForLogicalOperands: true,
        },
      ],
      'no-useless-catch': 'error',
      'no-ex-assign': 'error',
      'no-fallthrough': 'error',
      'default-case': 'error',
      'default-case-last': 'error',
      'no-duplicate-case': 'error',
      'no-case-declarations': 'error',
      eqeqeq: 'error',
      'no-compare-neg-zero': 'error',
      'no-invalid-regexp': 'error',
      'no-control-regex': 'error',
      'no-empty-character-class': 'error',
      'no-with': 'error',
      'no-eval': 'error',
      'no-new-wrappers': 'error',
      'no-global-assign': 'error',
      'no-debugger': 'error',
      'no-caller': 'error',
      'prefer-rest-params': 'error',
      'no-implicit-coercion': [
        'error',
        {
          allow: ['!!'],
        },
      ],
      'array-bracket-newline': ['error', 'consistent'],
      'eslint-comments/require-description': 'warn',
      'eslint-comments/no-unused-disable': 'error',
      'max-lines': [
        'error',
        { max: 500, skipComments: true, skipBlankLines: true },
      ],
      'no-unused-labels': 'error',
    },
  },
];
