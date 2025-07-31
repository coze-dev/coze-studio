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
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

interface SubWorkflowInfo {
  spaceId: string;
  workflowId: string;
  workflowVersion: string;
}

/**
 * Get subprocess information
 * @param node child process node
 * @returns spaceId and workflowId
 */
export function getSubWorkflowInfo(
  node: WorkflowNodeEntity,
): SubWorkflowInfo | undefined {
  const formData = node.getData<FlowNodeFormData>(FlowNodeFormData);
  const formItem = formData?.formModel.getFormItemValueByPath('/inputs');

  if (!formItem) {
    return;
  }

  return {
    spaceId: formItem.spaceId,
    workflowId: formItem.workflowId,
    workflowVersion: formItem.workflowVersion,
  };
}
