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
import { noNewErrorRule } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('no-new-error', noNewErrorRule, {
  valid: [
    {
      code: `(function(){
          class CustomError extends Error {
            constructor(eventName, msg) {
              super(msg);
              this.eventName = eventName;
              this.msg = msg;
              this.name = 'CustomError';
            }
          };
          new CustomError('copy_error', 'empty copy');
      })();`,
    },
  ],
  invalid: [
    {
      code: 'throw new Error("error message")',
      output: 'throw new CustomError(\'normal_error\', "error message")',
      errors: [
        {
          messageId: 'no-new-error',
          data: { name: 'new Error', lineCount: 1, maxLines: 1 },
        },
      ],
    },
  ],
});
