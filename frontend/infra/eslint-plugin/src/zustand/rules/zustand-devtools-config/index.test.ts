import { ruleTester } from '../tester';
import { devtoolsConfig } from '.';

const code = "import { devtools } from 'zustand/middleware';";

ruleTester.run('devtools-config', devtoolsConfig, {
  valid: [
    {
      code: 'devtools()',
    },
    {
      code: `${code}devtools(() => {}, {enabled:true,name:'name'})`,
    },
  ],
  invalid: [
    {
      code: `${code}devtools(() => {});`,
      errors: [
        {
          messageId: 'noEmptyCfg',
          suggestions: [
            {
              messageId: 'addCfg',
              output: `${code}devtools(() => {},{name:'DEV_TOOLS_NAME_SPACE'});`,
            },
          ],
        },
      ],
    },
    {
      code: `${code}devtools(() => {}, {});`,
      errors: [
        {
          messageId: 'nameCfg',
        },
        {
          messageId: 'enabledCfg',
        },
      ],
    },
  ],
});
