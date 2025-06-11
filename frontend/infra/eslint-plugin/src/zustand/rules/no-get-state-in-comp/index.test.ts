import { ruleTester } from '../tester';
import { noGetStateInComp } from './index';

ruleTester.run('no-get-state-in-comp', noGetStateInComp, {
  valid: [
    {
      code: 'function App() { const s = useStore() ;return (<div></div>)}',
      filename: 'index.tsx',
    },
    {
      code: 'const App = () => { const s = useStore() ;return (<div></div>)}',
      filename: 'index.tsx',
    },
  ],
  invalid: [
    {
      code: 'const App = () => { const s = useStore.getState() ;return (<div></div>)}',
      filename: 'index.tsx',
      errors: [{ messageId: 'noGetState' }],
    },
  ],
});
