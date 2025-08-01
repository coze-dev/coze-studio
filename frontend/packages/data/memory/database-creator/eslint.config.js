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

const { defineConfig } = require('@coze-arch/eslint-config');

module.exports = defineConfig({
  packageRoot: __dirname,
  preset: 'web',
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    '@coze-arch/max-line-per-function': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@coze-arch/no-deep-relative-import': 'warn',
    '@typescript-eslint/no-namespace': [
      'error',
      {
        allowDeclarations: true,
      },
    ],
  },
  overrides: [
    {
      files: ['src/**/namespaces/*.ts'],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
  ],
});
