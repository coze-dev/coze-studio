import { RuleTester } from 'eslint';
import { noDeepRelativeImportRule } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('no-deep-relative-import', noDeepRelativeImportRule, {
  valid: [
    'import "./abc"',
    'import "../abc"',
    'import "abc"',
    'require("./abc")',
    'require("../abc")',
    'require("abc")',
    'require(123)',
    'require(xabc)',
    'import("./abc")',
    'import("../abc")',
    'import("abc")',
    'import(123)',
    'import(xabc)',
    {
      code: 'import "../../../abc"',
      options: [{ max: 4 }],
    },
  ],
  invalid: [
    {
      code: 'import "../../../abc"',
      errors: [
        {
          messageId: 'max',
          data: { max: 3 },
        },
      ],
    },
    {
      code: 'require("../../../abc")',
      errors: [
        {
          messageId: 'max',
          data: { max: 3 },
        },
      ],
    },
    {
      code: 'import("../../../abc")',
      errors: [
        {
          messageId: 'max',
          data: { max: 3 },
        },
      ],
    },
    {
      code: 'import "../../../../../abc"',
      options: [{ max: 4 }],
      errors: [
        {
          messageId: 'max',
          data: { max: 4 },
        },
      ],
    },
  ],
});
