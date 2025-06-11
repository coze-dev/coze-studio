import { RuleTester } from 'eslint';
import { noBatchImportOrExportRule } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('no-batch-import-or-export', noBatchImportOrExportRule, {
  valid: [
    { code: 'import { foo } from "someModule"' },
    { code: 'import foo from "someModule"' },
    { code: 'export { foo } from "someModule"' },
  ],
  invalid: [
    {
      code: 'import * as foo from "someModule"',
      errors: [
        {
          messageId: 'avoidUseBatchImport',
          data: { code: 'import * as foo from "someModule"' },
        },
      ],
    },
    {
      code: 'export * from "someModule"',
      errors: [
        {
          messageId: 'avoidUseBatchExport',
          data: { code: 'export * from "someModule"' },
        },
      ],
    },
    {
      code: 'export * as foo from "someModule"',
      errors: [
        {
          messageId: 'avoidUseBatchExport',
          data: { code: 'export * as foo from "someModule"' },
        },
      ],
    },
  ],
});
