import { ruleTester } from '../tester';
import { storeFilenameConvention } from './index';

const code = "import { create } from 'zustand'; const store = create()() ";

ruleTester.run('store-filename-convention', storeFilenameConvention, {
  valid: [
    {
      code,
      filename: 'foo-store.ts',
    },
    {
      code,
      filename: 'fooStore.ts',
    },
  ],
  invalid: [
    {
      code,
      filename: 'store.ts',
      errors: [{ messageId: 'nameConvention' }],
    },
    {
      code,
      filename: 'foo.ts',
      errors: [{ messageId: 'nameConvention' }],
    },
  ],
});
