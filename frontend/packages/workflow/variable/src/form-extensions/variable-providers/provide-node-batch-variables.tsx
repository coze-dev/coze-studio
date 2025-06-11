import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { Disposable } from '@flowgram-adapter/common';

import { parseNodeBatchByInputList } from '../../core';

export const provideNodeBatchVariables: VariableProviderAbilityOptions = {
  key: 'provide-node-batch-variables',
  namespace: '/node/locals',
  scope: 'private',
  parse(value, context) {
    const batchMode =
      context.formItem?.formModel.getFormItemValueByPath('/batchMode') ||
      context.formItem?.formModel.getFormItemValueByPath('/inputs/batchMode');

    if (batchMode !== 'batch') {
      return [];
    }

    return parseNodeBatchByInputList(context.node.id, value);
  },
  onInit(context) {
    const formData = context.node.getData(FlowNodeFormData);
    if (!formData) {
      return Disposable.create(() => null);
    }

    return formData.onDetailChange(_detail => {
      if (_detail.path.includes('/batchMode')) {
        context.triggerSync();
      }
    });
  },
};
