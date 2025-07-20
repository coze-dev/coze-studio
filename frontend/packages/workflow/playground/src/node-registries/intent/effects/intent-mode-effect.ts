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

/** 表单创建后，重新赋值，需要等待个延时时间 */
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

  // formData 为格式化后的后端数据
  const formData = context.node.getData(FlowNodeFormData);
  const lineService =
    context.node?.getService<WorkflowLinesService>(WorkflowLinesService);

  const lines = lineService.getAllLines();

  // 获取所有从该节点出发的连线
  const linesFrom = lines.filter(line => line.from.id === context.node.id);

  setTimeout(() => {
    const outputsFormItem =
      formData.formModel.getFormItemByPath(DEFAULT_OUTPUTS_PATH);

    // 同步输出，标准模式和极简模式不一致
    if (outputsFormItem) {
      outputsFormItem.value = getDefaultOutputs(value);
    }

    const intentsFormItem = formData.formModel.getFormItemByPath('/intents');

    const quickIntentsFormItem =
      formData.formModel.getFormItemByPath('/quickIntents');

    // 从标准模式切换到极简模式，如果原来设置的意图数量大于极简模式的最大值，需要截断
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
        // 极速模式，如果当前极速模式没有意图，则从完整模式的意图中截取
        quickIntentsFormItem.value = cloneDeep(
          intentsFormItem?.value.slice(0, MAX_COUNT_IN_MINIMAL_MODE),
        );

        // 重新连线
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
        // 完整模式，如果当前完整模式没有意图，则从极简模式的意图中截取
        intentsFormItem.value = cloneDeep(quickIntentsFormItem?.value);

        // 重新连线
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

    // 触发一次校验
    formData.formModel.validate();
  }, DELAY_TIME);
};
