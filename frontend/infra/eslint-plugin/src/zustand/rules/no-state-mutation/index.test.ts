import { ruleTester } from '../tester';
import { noStateMutation } from './index';

ruleTester.run('no-state-mutation', noStateMutation, {
  valid: [],
  invalid: [
    {
      code: 'const state = useFooStore.getState(); state.foo += 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'const state = useFooStore.getState(); state.foo.bar.baz = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'const { foo: { foo: [{ foo: bar }] }} = useFooStore.getState();bar.bar = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'useFooStore.getState().foo.bar.baz = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'const state = useFooStore.getState(); const state2 = useBarStore.getState(); const fn = () => () => state.foo.bar.baz = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
  ],
});
