import { PrivateScopeProvider } from '@coze-workflow/variable';

import { NodeConfigForm } from '@/node-registries/common/components';

import {
  LoopArrayField,
  LoopCountField,
  LoopOutputsField,
  LoopSettingsSection,
  LoopTypeField,
  LoopVariablesField,
} from './loop-fields';
import { LoopPath } from './constants';

export const LoopFormRender = () => (
  <NodeConfigForm>
    <PrivateScopeProvider>
      <LoopSettingsSection>
        <LoopTypeField name={LoopPath.LoopType} />
        <LoopCountField name={LoopPath.LoopCount} />
      </LoopSettingsSection>
      <LoopArrayField name={LoopPath.LoopArray} />
      <LoopVariablesField name={LoopPath.LoopVariables} />
    </PrivateScopeProvider>
    <LoopOutputsField name={LoopPath.LoopOutputs} />
  </NodeConfigForm>
);
