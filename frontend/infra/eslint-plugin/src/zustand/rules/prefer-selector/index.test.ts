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
