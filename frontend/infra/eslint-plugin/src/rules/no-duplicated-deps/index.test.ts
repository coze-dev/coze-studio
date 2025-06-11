import { RuleTester } from 'eslint';
import { jsonParser } from '../../processors/json';
import { noDuplicatedDepsRule } from './index';

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

const ruleTester = new RuleTester();

ruleTester.run(
  'no-duplicated-deps',
  noDuplicatedDepsRule,
  preprocess({
    valid: [
      {
        code: '{}',
        filename: 'xx/package.json',
      },
      {
        code: JSON.stringify({ dependencies: {} }),
        filename: 'xx/package.json',
      },
      {
        code: JSON.stringify({ dependencies: {}, devDependencies: {} }),
        filename: 'xx/package.json',
      },
      {
        code: JSON.stringify({
          dependencies: { a: '0.0.1', b: '1.0.0' },
          devDependencies: { c: '1.0.0' },
        }),
        filename: 'xx/package.json',
      },
    ],
    invalid: [
      {
        code: JSON.stringify({
          dependencies: { a: '0.0.1' },
          devDependencies: { a: '1.0.0' },
        }),
        filename: 'xx/package.json',
        errors: [
          {
            messageId: 'no-duplicated',
            data: { depName: 'a' },
          },
        ],
      },
      {
        code: JSON.stringify({
          dependencies: { a: '0.0.1', b: '0.1.1', c: '0.1.0' },
          devDependencies: { a: '1.0.0', b: '0.1.1' },
        }),
        filename: 'xx/package.json',
        errors: [
          {
            messageId: 'no-duplicated',
            data: { depName: 'a' },
          },
          {
            messageId: 'no-duplicated',
            data: { depName: 'b' },
          },
        ],
      },
    ],
  }),
);
