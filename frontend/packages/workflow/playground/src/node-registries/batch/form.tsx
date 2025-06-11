import { PrivateScopeProvider } from '@coze-workflow/variable';

import { NodeConfigForm } from '@/node-registries/common/components';

import {
  BatchConcurrentSizeField,
  BatchInputsField,
  BatchOutputsField,
  BatchSettingsSection,
  BatchSizeField,
} from './fields';
import { BatchPath } from './constants';

export const BatchFormRender = () => (
  <NodeConfigForm>
    <PrivateScopeProvider>
      <BatchSettingsSection>
        <BatchConcurrentSizeField name={BatchPath.ConcurrentSize} />
        <BatchSizeField name={BatchPath.BatchSize} />
      </BatchSettingsSection>
      <BatchInputsField name={BatchPath.Inputs} />
    </PrivateScopeProvider>
    <BatchOutputsField name={BatchPath.Outputs} />
  </NodeConfigForm>
);
