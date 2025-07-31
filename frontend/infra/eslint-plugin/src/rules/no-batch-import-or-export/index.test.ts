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

import { RuleTester } from 'eslint';
import { noBatchImportOrExportRule } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('no-batch-import-or-export', noBatchImportOrExportRule, {
  valid: [
    { code: 'import { foo } from "someModule"' },
    { code: 'import foo from "someModule"' },
    { code: 'export { foo } from "someModule"' },
  ],
  invalid: [
    {
      code: 'import * as foo from "someModule"',
      errors: [
        {
          messageId: 'avoidUseBatchImport',
          data: { code: 'import * as foo from "someModule"' },
        },
      ],
    },
    {
      code: 'export * from "someModule"',
      errors: [
        {
          messageId: 'avoidUseBatchExport',
          data: { code: 'export * from "someModule"' },
        },
      ],
    },
    {
      code: 'export * as foo from "someModule"',
      errors: [
        {
          messageId: 'avoidUseBatchExport',
          data: { code: 'export * as foo from "someModule"' },
        },
      ],
    },
  ],
});
