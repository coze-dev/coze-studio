import { PrivateScopeProvider } from '@coze-workflow/variable';

import {
  InputParameters,
  Outputs,
} from '@/components/node-render/node-render-new/fields';

import { BatchPort } from './batch-content';

export const BatchContent = () => (
  <PrivateScopeProvider>
    <InputParameters />
    <Outputs />
    <BatchPort />
  </PrivateScopeProvider>
);
