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

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormBatchProperties(node) {
    const batchModePath = '/inputs/batchMode';
    const batchMode = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath(batchModePath);
    const path = node.getNodeMeta()?.batchPath;
    if (batchMode !== 'batch' || !path) {
      return {};
    }
    const batchData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath(path);
    return generateParametersToProperties(batchData, { node });
  },
  generateFormInputProperties(node) {
    const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
    const detail = nodeData.getNodeData<StandardNodeType.Api>();
    const inputs = detail?.inputs;
    if (!inputs || !Array.isArray(inputs)) {
      return {};
    }
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputData = formData?.inputs?.inputParameters || {};
    const inputParameters = inputs.map(i => ({
      input: inputData[i.name],
      name: i.name,
      required: i.required,
    }));

    return generateParametersToProperties(inputParameters, { node });
  },
};
