import { ruleTester } from '../tester';
import { preferShallow } from './index';

const importSnippet = "\nimport { useShallow } from 'zustand/react/shallow';\n";

ruleTester.run('prefer-shallow', preferShallow, {
  valid: [
    'foo()',
    'new Foo()',
    'useShallowedFooStore()',
    'useFooStore((s) => s.value)',
    'useFooStore(selector)', // 暂时豁免
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
