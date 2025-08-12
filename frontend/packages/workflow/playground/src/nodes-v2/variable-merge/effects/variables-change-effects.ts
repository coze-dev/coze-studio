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
  createEffectOptions,
  DataEvent,
  type Effect,
  type FlowNodeEntity,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowVariableService } from '@coze-workflow/variable';

export const variablesChangeEffects = [
  createEffectOptions<Effect>(DataEvent.onValueChange, params => {
    const { node } = params.context as {
      node: FlowNodeEntity;
      playgroundContext: { variableService: WorkflowVariableService };
    };
    const formModel = node
      ?.getData(FlowNodeFormData)
      ?.getFormModel<FormModelV2>()?.nativeFormModel;

    if (!formModel) {
      return;
    }

    // Todo any type requires sdk export
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (formModel.getField(params.name) as any)?.map(child => {
      child?.validate();
    });
  }),
];
