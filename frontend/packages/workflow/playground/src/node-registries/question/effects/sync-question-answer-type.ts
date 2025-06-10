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
