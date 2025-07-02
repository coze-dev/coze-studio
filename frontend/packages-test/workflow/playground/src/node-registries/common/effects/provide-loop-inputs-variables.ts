import { createEffectFromVariableProvider } from '@coze-workflow/variable/src/utils/variable-provider';
import { provideLoopInputsVariables } from '@coze-workflow/variable/src/form-extensions/variable-providers/provide-loop-input-variables';

export const provideLoopInputsVariablesEffect =
  createEffectFromVariableProvider(provideLoopInputsVariables);
