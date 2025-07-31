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

import { ruleTester } from '../tester';
import { preferSelector } from './index';

ruleTester.run('prefer-selector', preferSelector, {
  valid: [
    'foo()',
    'new Foo()',
    'useFooStore((s) => {})',
    'useFooStore(selector)',
    'useFooStore.getState()',
  ],
  invalid: [
    {
      code: 'useFooStore()',
      errors: [{ messageId: 'preferSelector' }],
    },
    {
      code: 'const {a, b}  = useFooStore()',
      errors: [
        {
          messageId: 'preferSelector',
          suggestions: [
            {
              messageId: 'useSelectorKeyValue',
              output:
                'const {a, b}  = useFooStore((state) => ({a: state.a, b: state.b}))',
            },
            {
              messageId: 'useSelectorUnderlineAlias',
              output:
                'const {a, b}  = useFooStore(({a: _a, b: _b}) => ({a: _a, b: _b}))',
            },
            {
              messageId: 'useSelectorDestruct',
              output: 'const {a, b}  = useFooStore(({a, b}) => ({a, b}))',
            },
          ],
        },
      ],
    },
    {
      code: 'const {a:c, b}  = useFooStore()',
      errors: [
        {
          messageId: 'preferSelector',
          suggestions: [
            {
              messageId: 'useSelectorKeyValue',
              output:
                'const {a:c, b}  = useFooStore((state) => ({a: state.a, b: state.b}))',
            },
            {
              messageId: 'useSelectorUnderlineAlias',
              output:
                'const {a:c, b}  = useFooStore(({a: _a, b: _b}) => ({a: _a, b: _b}))',
            },
            {
              messageId: 'useSelectorDestruct',
              output: 'const {a:c, b}  = useFooStore(({a, b}) => ({a, b}))',
            },
          ],
        },
      ],
    },
    {
      code: 'const {a, ...b}  = useFooStore()',
      errors: [{ messageId: 'preferSelector' }],
    },
  ],
});
