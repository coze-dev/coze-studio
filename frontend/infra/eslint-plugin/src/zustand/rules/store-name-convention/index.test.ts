import { ruleTester } from '../tester';
import { storeNameConvention } from './index';

ruleTester.run('store-name-convention', storeNameConvention, {
  valid: [
    {
      code: "import { create } from 'zustand'; \n const useStore = create()",
    },
    {
      code: "import { create } from 'zustand'; \n const useFooStore = create()",
    },
    {
      code: "import { create } from 'zustand'; \n const createStore = () => { const useFooStore = create() }",
    },
    {
      code: "import { create } from 'foo'; \n const foo = create() ",
    },
  ],
  invalid: [
    {
      code: "import { create } from 'zustand';\n const foo = create()",
      errors: [{ messageId: 'nameConvention' }],
    },
    {
      code: "import { create } from 'zustand';\n createStore = () => {const foo = create()}",
      errors: [{ messageId: 'nameConvention' }],
    },
  ],
});
