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

import { jsonParser } from './processors/json';
import { disallowDepRule } from './rules/package-disallow-deps';
import { noDeepRelativeImportRule } from './rules/no-deep-relative-import';
import { noDuplicatedDepsRule } from './rules/no-duplicated-deps';
import { requireAuthorRule } from './rules/package-require-author';
import { maxLinePerFunctionRule } from './rules/max-lines-per-function';
import { noNewErrorRule } from './rules/no-new-error';
import { noBatchImportOrExportRule } from './rules/no-batch-import-or-export';
import { useErrorInCatch } from './rules/use-error-in-catch';
import { noEmptyCatch } from './rules/no-empty-catch';
import { noPkgDirImport } from './rules/no-pkg-dir-import';
import { tsxNoLeakedRender } from './rules/tsx-no-leaked-render';

export const flowPreset = {
  rules: {
    'package-require-author': requireAuthorRule,
    'package-disallow-deps': disallowDepRule,
    'no-deep-relative-import': noDeepRelativeImportRule,
    'no-duplicated-deps': noDuplicatedDepsRule,
    'max-line-per-function': maxLinePerFunctionRule,
    'no-new-error': noNewErrorRule,
    'no-batch-import-or-export': noBatchImportOrExportRule,
    'no-empty-catch': noEmptyCatch,
    'use-error-in-catch': useErrorInCatch,
    'no-pkg-dir-import': noPkgDirImport,
    'tsx-no-leaked-render': tsxNoLeakedRender,
  },
  configs: {
    recommended: [
      {
        rules: {
          '@coze-arch/tsx-no-leaked-render': 'warn',
          '@coze-arch/no-pkg-dir-import': 'error',
          '@coze-arch/no-duplicated-deps': 'error',
          // Relative applications with more than 4 layers are not allowed
          '@coze-arch/no-deep-relative-import': [
            'error',
            {
              max: 4,
            },
          ],
          '@coze-arch/package-require-author': 'error',
          // Function code lines should not exceed 150.
          '@coze-arch/max-line-per-function': [
            'error',
            {
              max: 150,
            },
          ],
          '@coze-arch/no-new-error': 'off',
          '@coze-arch/no-batch-import-or-export': 'error',
          '@coze-arch/no-empty-catch': 'error',
          '@coze-arch/use-error-in-catch': 'warn',
        },
      },
      {
        files: ['package.json'],
        processor: '@coze-arch/json-processor',
        rules: {
          // TODO: It needs to be refactored to parse json directly, otherwise the global rules will take effect on the file'package.js' processed by the processor.
          //https://github.com/eslint/json
          '@coze-arch/package-require-author': 'error',
          '@coze-arch/package-disallow-deps': 'error',
          // Close the prettier rule because there is a bug in the rule lint package.js
          'prettier/prettier': 'off',
        },
      },
    ],
  },
  processors: {
    'json-processor': jsonParser,
  },
};
