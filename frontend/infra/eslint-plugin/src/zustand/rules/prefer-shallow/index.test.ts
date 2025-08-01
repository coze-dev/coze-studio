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
import { preferShallow } from './index';

const importSnippet = "\nimport { useShallow } from 'zustand/react/shallow';\n";

ruleTester.run('prefer-shallow', preferShallow, {
  valid: [
    'foo()',
    'new Foo()',
    'useShallowedFooStore()',
    'useFooStore((s) => s.value)',
    'useFooStore(selector)', // Temporary exemption
    'useShallowFooStore(() => ({}))',
    'useFooStore(useShallow(() => ({})))',
    'useFooStore(useShallow(() => ([])))',
    'useFooStore.getState()',
  ],
  invalid: [
    {
      code: 'useFooStore(() => { return ({}) })',
      errors: [
        {
          suggestions: [
            {
              output: `${importSnippet}useFooStore(useShallow(() => { return ({}) }))`,
              messageId: 'useShallow',
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
    {
      code: 'useFooStore(() => { return {} })',
      errors: [
        {
          suggestions: [
            {
              output: `${importSnippet}useFooStore(useShallow(() => { return {} }))`,
              messageId: 'useShallow',
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
    {
      code: 'useFooStore(() =>  ({}))',
      errors: [
        {
          suggestions: [
            {
              output: `${importSnippet}useFooStore(useShallow(() =>  ({})))`,
              messageId: 'useShallow',
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
    {
      code: 'useFooStore(() => { return ([]) })',
      errors: [
        {
          suggestions: [
            {
              output: `${importSnippet}useFooStore(useShallow(() => { return ([]) }))`,
              messageId: 'useShallow',
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
    {
      code: 'useFooStore(() => { return [] })',
      errors: [
        {
          suggestions: [
            {
              messageId: 'useShallow',
              output: `${importSnippet}useFooStore(useShallow(() => { return [] }))`,
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
    {
      code: 'useFooStore(() => ([]))',
      errors: [
        {
          suggestions: [
            {
              messageId: 'useShallow',
              output: `${importSnippet}useFooStore(useShallow(() => ([])))`,
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
    {
      code: 'useFooStore(() => { const a = {}; return a;})',
      errors: [
        {
          suggestions: [
            {
              output: `${importSnippet}useFooStore(useShallow(() => { const a = {}; return a;}))`,
              messageId: 'useShallow',
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
    {
      code: 'useFooStore(() => { const a = []; return a;})',
      errors: [
        {
          suggestions: [
            {
              output: `${importSnippet}useFooStore(useShallow(() => { const a = []; return a;}))`,
              messageId: 'useShallow',
            },
          ],
          messageId: 'preferShallow',
        },
      ],
    },
  ],
});
