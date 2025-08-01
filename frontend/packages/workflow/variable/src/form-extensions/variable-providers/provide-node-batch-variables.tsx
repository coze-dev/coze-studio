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
