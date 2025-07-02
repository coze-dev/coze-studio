import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariables } from './variable-providers/provide-node-output-variables';
import { provideNodeBatchVariables } from './variable-providers/provide-node-batch-variables';
import { provideLoopOutputsVariables } from './variable-providers/provide-loop-output-variables';
import { provideLoopInputsVariables } from './variable-providers/provide-loop-input-variables';
import { consumeRefValueExpression } from './variable-consumers/consume-ref-value-expression';
import { privateScopeDecorator } from './decorators/private-scope-decorator';

export { provideMergeGroupVariablesEffect } from './variable-providers/provide-merge-group-variables';

export const variableProviders: VariableProviderAbilityOptions[] = [
  provideNodeOutputVariables,
  provideNodeBatchVariables,
  provideLoopInputsVariables,
  provideLoopOutputsVariables,
];

export const variableConsumers = [consumeRefValueExpression];

export const variableDecorators = [privateScopeDecorator];
