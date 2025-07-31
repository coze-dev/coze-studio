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
import { preferMiddlewares } from '.';

const code = "import { create } from 'zustand';";

ruleTester.run('prefer-middlewares', preferMiddlewares, {
  valid: [
    {
      code: `${code}const store = create(m1())`,
      options: [{ middlewares: ['m1'] }],
    },
    {
      code: `${code}const store = create()(m1())`,
      options: [{ middlewares: ['m1'] }],
    },
    {
      code: `${code}const store = create(m1(m2(() => ({}))))`,
      options: [{ middlewares: ['m1', 'm2'] }],
    },
    {
      code: `${code}const store = create()(m1(m2(() => ({}))))`,
      options: [{ middlewares: ['m1', 'm2'] }],
    },
  ],
  invalid: [
    {
      code: `${code}const store = create()`,
      errors: [
        {
          messageId: 'preferMiddlewares',
          suggestions: [
            {
              messageId: 'applyMiddlewares',
              output: `${code}import { devtools } from 'zustand/middleware';\nconst store = create(devtools())`,
            },
          ],
        },
      ],
    },
    {
      code: `${code}const store = create()()`,
      errors: [
        {
          messageId: 'preferMiddlewares',
          suggestions: [
            {
              messageId: 'applyMiddlewares',
              output: `${code}import { devtools } from 'zustand/middleware';\nconst store = create()(devtools())`,
            },
          ],
        },
      ],
    },
    {
      code: `${code}const store = create()(m1())`,
      errors: [
        {
          messageId: 'preferMiddlewares',
          suggestions: [
            {
              messageId: 'applyMiddlewares',
              output: `${code}import { devtools } from 'zustand/middleware';\nconst store = create()(devtools(m1()))`,
            },
          ],
        },
      ],
    },
    {
      code: `${code}const store = create()(m1(() => {}))`,
      options: [{ middlewares: ['m2'] }],
      errors: [
        {
          messageId: 'preferMiddlewares',
          suggestions: [
            {
              messageId: 'applyMiddlewares',
              output: `${code}const store = create()(m2(m1(() => {})))`,
            },
          ],
        },
      ],
    },
    {
      code: `${code}const store = create()(m1(() => {}))`,
      options: [
        {
          middlewares: [
            { name: 'm2', suggestImport: 'import {m2} from "m2";' },
          ],
        },
      ],
      errors: [
        {
          messageId: 'preferMiddlewares',
          suggestions: [
            {
              messageId: 'applyMiddlewares',
              output: `${code}import {m2} from "m2";const store = create()(m2(m1(() => {})))`,
            },
          ],
        },
      ],
    },
    {
      code: `${code}const store = create()(m1(() => {}))`,
      options: [
        {
          middlewares: [
            { name: 'm2', suggestImport: 'import {m2} from "m2";' },
            { name: 'm3', suggestImport: 'import {m3} from "m3";' },
          ],
        },
      ],
      errors: [
        {
          messageId: 'preferMiddlewares',
          suggestions: [
            {
              messageId: 'applyMiddlewares',
              output: `${code}import {m2} from "m2";const store = create()(m2(m1(() => {})))`,
            },
            {
              messageId: 'applyMiddlewares',
              output: `${code}import {m3} from "m3";const store = create()(m3(m1(() => {})))`,
            },
          ],
        },
      ],
    },
  ],
});
