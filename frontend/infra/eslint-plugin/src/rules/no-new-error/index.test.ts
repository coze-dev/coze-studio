import { RuleTester } from 'eslint';
import { noNewErrorRule } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('no-new-error', noNewErrorRule, {
  valid: [
    {
      code: `(function(){
          class CustomError extends Error {
            constructor(eventName, msg) {
              super(msg);
              this.eventName = eventName;
              this.msg = msg;
              this.name = 'CustomError';
            }
          };
          new CustomError('copy_error', 'empty copy');
      })();`,
    },
  ],
  invalid: [
    {
      code: 'throw new Error("error message")',
      output: 'throw new CustomError(\'normal_error\', "error message")',
      errors: [
        {
          messageId: 'no-new-error',
          data: { name: 'new Error', lineCount: 1, maxLines: 1 },
        },
      ],
    },
  ],
});
