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

import {
  type Effect,
  DataEvent,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableTreeNode } from '@coze-workflow/base';

import { WorkflowModelsService } from '@/services';

import { getOutputs } from './utils';

function createEffect(): Effect {
  return ({ value, context: { node } }) => {
    const modelType = value?.modelType;

    const form = node
      ?.getData(FlowNodeFormData)
      ?.getFormModel<FormModelV2>()?.nativeFormModel;

    if (!form || !modelType) {
      return;
    }

    const outputs = form.getValueIn<ViewVariableTreeNode[] | undefined>(
      'outputs',
    );

    const isBatch = form.getValueIn('batchMode') === 'batch';
    const modelsService = node.getService(WorkflowModelsService);

    form.setValueIn(
      'outputs',
      getOutputs({ modelType, outputs, isBatch, modelsService }),
    );
  };
}

export const provideReasoningContentEffect = [
  {
    effect: createEffect(),
    event: DataEvent.onValueChange,
  },
];
