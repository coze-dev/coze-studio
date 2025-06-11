import { RuleTester } from 'eslint';
import { useErrorInCatch } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('use-error-in-catch', useErrorInCatch, {
  valid: ['try{ foo }catch(e){ console.log(e) }'],
  invalid: [
    {
      code: 'try{ foo }catch(error){ bar }',
      errors: [
        {
          messageId: 'use-error',
          data: { paramName: 'error' },
        },
      ],
    },
    {
      code: 'try{ foo }catch(e){}',
      errors: [
        {
          messageId: 'use-error',
          data: { paramName: 'e' },
        },
      ],
    },
    {
      code: 'try{ foo }catch(e){console.log(c)}',
      errors: [
        {
          messageId: 'use-error',
          data: { paramName: 'e' },
        },
      ],
    },
  ],
});
