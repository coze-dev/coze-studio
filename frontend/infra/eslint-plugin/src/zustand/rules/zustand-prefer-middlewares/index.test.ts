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
