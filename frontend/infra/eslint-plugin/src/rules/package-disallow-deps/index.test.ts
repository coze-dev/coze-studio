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

import { RuleTester } from 'eslint';
import { jsonParser } from '../../processors/json';
import { disallowDepRule } from './index';

const ruleTester = new RuleTester({});

function preprocess(tests) {
  for (const type of Object.keys(tests)) {
    const item = tests[type];
    tests[type] = tests[type].map(item => {
      item.code = jsonParser.preprocess(item.code)[0];
      if (item.output) {
        item.output = jsonParser.preprocess(item.output)[0];
      }
      return item;
    });
    tests[type] = item;
  }
  return tests;
}

ruleTester.run(
  'package-disallow-deps',
  disallowDepRule,
  preprocess({
    valid: [
      {
        code: JSON.stringify({
          dependencies: {
            react: '^16.0.0',
          },
        }),
        filename: 'xx/package.json',
      },
      {
        code: JSON.stringify({}),
        filename: 'xx/package.json',
      },
    ],
    invalid: [
      {
        code: JSON.stringify({
          dependencies: {
            react: '^16.0.0',
          },
        }),
        filename: 'xx/package.json',
        options: [['react']],
        errors: [
          {
            messageId: 'disallowDep',
            data: { dependence: 'react', tips: '' },
          },
        ],
      },
      {
        code: JSON.stringify({
          dependencies: {
            react: '^16.0.0',
          },
        }),
        filename: 'xx/package.json',
        options: [[['react', '<17', 'abc']]],
        errors: [
          {
            messageId: 'disallowVersion',
            data: {
              dependence: 'react',
              version: '^16.0.0',
              blockVersion: '<17',
              tips: 'abc',
            },
          },
        ],
      },
      {
        code: JSON.stringify({
          dependencies: {
            react: '^16.0.0',
            'react-dom': '^16',
          },
        }),
        filename: 'xx/package.json',
        options: [[['react', '<17'], 'react-dom']],
        errors: [
          {
            messageId: 'disallowVersion',
            data: {
              dependence: 'react',
              version: '^16.0.0',
              tips: '',
              blockVersion: '<17',
            },
          },
          {
            messageId: 'disallowDep',
            data: { dependence: 'react-dom', tips: '' },
          },
        ],
      },
      {
        code: JSON.stringify({
          dependencies: {
            react: '^16.0.0',
          },
          devDependencies: {
            'react-dom': '^16',
          },
        }),
        filename: 'xx/package.json',
        options: [[['react', '<17'], 'react-dom']],
        errors: [
          {
            messageId: 'disallowVersion',
            data: {
              dependence: 'react',
              version: '^16.0.0',
              blockVersion: '<17',
              tips: '',
            },
          },
          {
            messageId: 'disallowDep',
            data: { dependence: 'react-dom', tips: '' },
          },
        ],
      },
    ],
  }),
);
