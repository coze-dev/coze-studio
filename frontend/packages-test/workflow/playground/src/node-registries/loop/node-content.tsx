import { PrivateScopeProvider } from '@coze-workflow/variable';

import { Outputs } from '@/components/node-render/node-render-new/fields';

import { LoopArray, LoopPort, LoopVariables } from './loop-content';

export const LoopContent = () => (
  <PrivateScopeProvider>
    <LoopArray />
    <LoopVariables />
    <Outputs />
    <LoopPort />
  </PrivateScopeProvider>
);
