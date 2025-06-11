import { RuleTester } from 'eslint';
import { noEmptyCatch } from './index';

const ruleTester = new RuleTester({});

ruleTester.run('no-empty-catch', noEmptyCatch, {
  valid: ['try{ foo }catch(e){ console.log(e) }', 'try{ foo }catch(e){ bar }'],
  invalid: [
    {
      code: 'try{ foo }catch(e){ /* */ }',
      errors: [
        {
          messageId: 'no-empty',
        },
      ],
    },
    {
      code: 'try{ foo }catch(e){}',
      errors: [
        {
          messageId: 'no-empty',
        },
      ],
    },
    {
      code: `try{ foo }catch(e){
//
      }`,
      errors: [
        {
          messageId: 'no-empty',
        },
      ],
    },
  ],
});
