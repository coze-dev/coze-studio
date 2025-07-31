/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
