import path from 'path';
import { RuleTester } from 'eslint';

import parser from '@typescript-eslint/parser';
import { tsxNoLeakedRender } from '.';


const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      tsconfigRootDir: path.resolve(__dirname, './fixture'),
      project: path.resolve(__dirname, './fixture/tsconfig.json'),
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run('tsx-no-leaked-render', tsxNoLeakedRender, {
  valid: [
    {
      code: 'const Foo = (isBar: string) => (<div data-bar={ isBar && "bar" } />);',
      filename: 'react.tsx',
    },
  ],
  invalid: [],
});
