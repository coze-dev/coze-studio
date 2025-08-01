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

import { cloneDeep } from 'lodash-es';
import {
  type Effect,
  FlowNodeFormData,
} from '@flowgram-adapter/free-layout-editor';
import { INTENT_NODE_MODE, DEFAULT_OUTPUTS_PATH } from '@coze-workflow/nodes';

import { WorkflowLinesService } from '@/services/workflow-line-service';
import { getDefaultOutputs } from '@/node-registries/intent/constants';

/** After the form is created, reassign the value and wait for a delay. */
const DELAY_TIME = 200;
const MAX_COUNT_IN_MINIMAL_MODE = 10;

const isEmptyIntents = (intents: { name: string }[]) =>
  intents.every(intent => !intent.name);

export const handleIntentModeChange: Effect = props => {
  const { value, context } = props;
  const isMinimal = value === INTENT_NODE_MODE.MINIMAL;

  if (!context?.node) {
    return;
  }

  // formData is the formatted backend data
  const formData = context.node.getData(FlowNodeFormData);
  const lineService =
    context.node?.getService<WorkflowLinesService>(WorkflowLinesService);

  const lines = lineService.getAllLines();

  // Get all connections originating from this node
  const linesFrom = lines.filter(line => line.from.id === context.node.id);

  setTimeout(() => {
    const outputsFormItem =
      formData.formModel.getFormItemByPath(DEFAULT_OUTPUTS_PATH);

    // Synchronous output, standard mode and minimalist mode are inconsistent
    if (outputsFormItem) {
      outputsFormItem.value = getDefaultOutputs(value);
    }

    const intentsFormItem = formData.formModel.getFormItemByPath('/intents');

    const quickIntentsFormItem =
      formData.formModel.getFormItemByPath('/quickIntents');

    // Switch from standard mode to minimalist mode, if the number of intents originally set is greater than the maximum value of minimalist mode, it needs to be truncated
    if (
      quickIntentsFormItem &&
      isMinimal &&
      Array.isArray(quickIntentsFormItem.value)
    ) {
      const quickIntentsLength = quickIntentsFormItem.value.length;
      if (
        quickIntentsLength <= 1 &&
        isEmptyIntents(quickIntentsFormItem.value)
      ) {
        // Quick Mode, if the current Quick Mode has no intent, is taken from the intent of the full mode
        quickIntentsFormItem.value = cloneDeep(
          intentsFormItem?.value.slice(0, MAX_COUNT_IN_MINIMAL_MODE),
        );

        // Reconnect
        linesFrom.forEach(line => {
          lineService.createLine({
            from: line.from.id,
            to: line.to?.id,
            fromPort: line.info?.fromPort,
            toPort: line.info?.toPort,
          });
        });
      }
    }

    if (intentsFormItem && !isMinimal && Array.isArray(intentsFormItem.value)) {
      const intentsLength = intentsFormItem.value.length;
      if (intentsLength <= 1 && isEmptyIntents(intentsFormItem.value)) {
        // Full mode, if the current full mode has no intention, it is taken from the intent of the minimalist mode
        intentsFormItem.value = cloneDeep(quickIntentsFormItem?.value);

        // Reconnect
        linesFrom.forEach(line => {
          lineService.createLine({
            from: line.from.id,
            to: line.to?.id,
            fromPort: line.info?.fromPort,
            toPort: line.info?.toPort,
          });
        });
      }
    }

    // Trigger a validation
    formData.formModel.validate();
  }, DELAY_TIME);
};
