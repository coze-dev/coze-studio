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
import { noDeepRelativeImportRule } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('no-deep-relative-import', noDeepRelativeImportRule, {
  valid: [
    'import "./abc"',
    'import "../abc"',
    'import "abc"',
    'require("./abc")',
    'require("../abc")',
    'require("abc")',
    'require(123)',
    'require(xabc)',
    'import("./abc")',
    'import("../abc")',
    'import("abc")',
    'import(123)',
    'import(xabc)',
    {
      code: 'import "../../../abc"',
      options: [{ max: 4 }],
    },
  ],
  invalid: [
    {
      code: 'import "../../../abc"',
      errors: [
        {
          messageId: 'max',
          data: { max: 3 },
        },
      ],
    },
    {
      code: 'require("../../../abc")',
      errors: [
        {
          messageId: 'max',
          data: { max: 3 },
        },
      ],
    },
    {
      code: 'import("../../../abc")',
      errors: [
        {
          messageId: 'max',
          data: { max: 3 },
        },
      ],
    },
    {
      code: 'import "../../../../../abc"',
      options: [{ max: 4 }],
      errors: [
        {
          messageId: 'max',
          data: { max: 4 },
        },
      ],
    },
  ],
});
