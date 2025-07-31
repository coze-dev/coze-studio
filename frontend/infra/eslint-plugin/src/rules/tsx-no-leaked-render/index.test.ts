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
