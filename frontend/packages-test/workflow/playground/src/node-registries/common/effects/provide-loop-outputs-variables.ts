import { createEffectFromVariableProvider } from '@coze-workflow/variable/src/utils/variable-provider';
import { provideLoopOutputsVariables } from '@coze-workflow/variable/src/form-extensions/variable-providers/provide-loop-output-variables';

export const provideLoopOutputsVariablesEffect =
  createEffectFromVariableProvider(provideLoopOutputsVariables);
