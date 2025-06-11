import { ruleTester } from '../tester';
import { preferCurryCreate } from '.';

const code = "import { create } from 'zustand';";

ruleTester.run('store-name-convention', preferCurryCreate, {
  valid: [
    {
      code: `${code}const store = create()()`,
    },
    {
      code: `${code} interface A {};const store = create<A>()()`,
    },
    {
      code: 'const create = () => {}; const store = create()',
    },
  ],
  invalid: [
    {
      code: `${code}const store = create()`,
      errors: [
        {
          messageId: 'preferCurryCreate',
          suggestions: [
            {
              messageId: 'curryCreate',
              output: `${code}const store = create()()`,
            },
          ],
        },
      ],
    },
    {
      code: `${code}const store = create<T>()`,
      errors: [
        {
          messageId: 'preferCurryCreate',
          suggestions: [
            {
              messageId: 'curryCreate',
              output: `${code}const store = create<T>()()`,
            },
          ],
        },
      ],
    },
  ],
});
