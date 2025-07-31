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
import { useErrorInCatch } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('use-error-in-catch', useErrorInCatch, {
  valid: ['try{ foo }catch(e){ console.log(e) }'],
  invalid: [
    {
      code: 'try{ foo }catch(error){ bar }',
      errors: [
        {
          messageId: 'use-error',
          data: { paramName: 'error' },
        },
      ],
    },
    {
      code: 'try{ foo }catch(e){}',
      errors: [
        {
          messageId: 'use-error',
          data: { paramName: 'e' },
        },
      ],
    },
    {
      code: 'try{ foo }catch(e){console.log(c)}',
      errors: [
        {
          messageId: 'use-error',
          data: { paramName: 'e' },
        },
      ],
    },
  ],
});
