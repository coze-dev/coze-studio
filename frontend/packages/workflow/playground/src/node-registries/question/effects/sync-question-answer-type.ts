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
 
import { isEqual, get } from 'lodash-es';
import {
  type Effect,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodePortsData } from '@flowgram-adapter/free-layout-editor';

import { formatOutput } from '../utils';

export const syncQuestionAnswerTypeEffect: Effect = props => {
  const { value, formValues, context } = props;
  const { node } = context;

  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const portsData = node.getData<WorkflowNodePortsData>(WorkflowNodePortsData);
  const outputs = get(formValues, 'outputs');

  if (value === 'text') {
    portsData.updateStaticPorts([
      {
        type: 'input',
      },
      {
        type: 'output',
      },
    ]);
  } else {
    portsData.updateStaticPorts([
      {
        type: 'input',
      },
    ]);
  }

  // 表单初始化时获取不到值，需要延时一会
  setTimeout(() => {
    let syncOutputValue: unknown = [];
    if (value === 'text') {
      if (outputs) {
        const questionOutputs = get(formValues, 'questionOutputs');
        syncOutputValue = formatOutput(questionOutputs);
      }
    } else {
      const optionOutput = get(formValues, 'questionOutputs.optionOutput');
      syncOutputValue = optionOutput;
    }

    // 将 questionOutput 的值同步到 output 上
    if (outputs && !isEqual(outputs, syncOutputValue)) {
      formModel.setValueIn('outputs', syncOutputValue);
    }
  }, 200);
};
