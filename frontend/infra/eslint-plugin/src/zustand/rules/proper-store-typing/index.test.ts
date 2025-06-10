import { ruleTester } from '../tester';
import { properStoreTyping } from '.';

const code = "import { create } from 'zustand';";

ruleTester.run('proper-store-typing', properStoreTyping, {
  valid: [
    {
      code: 'const foo = create()',
    },
    {
      code: `${code}const store = create<T>()`,
    },
    {
      code: `${code}const store = create<T>()()`,
    },
  ],
  invalid: [
    {
      code: `${code}const store = create()`,
      errors: [
        {
          messageId: 'storeTyping',
        },
      ],
    },
    {
      code: `${code}const store = create()()`,
      errors: [
        {
          messageId: 'storeTyping',
        },
      ],
    },
  ],
});
