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

import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';
import type { BasicStandardNodeTypes } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

/** Synchronize node template data */
export const createBatchFunctionTemplateData = (
  batchNode: WorkflowNodeEntity,
  batchFunctionNode: WorkflowNodeEntity,
) => {
  const batchNodeDataEntity =
    batchNode.getData<WorkflowNodeData>(WorkflowNodeData);
  const batchFunctionNodeDataEntity =
    batchFunctionNode.getData<WorkflowNodeData>(WorkflowNodeData);
  const batchNodeData = batchNodeDataEntity.getNodeData<keyof NodeData>();
  if (!batchNodeData) {
    return;
  }
  batchFunctionNodeDataEntity.setNodeData<BasicStandardNodeTypes>({
    title: I18n.t('workflow_batch_canvas_title'),
    description: I18n.t('workflow_batch_canvas_tooltips'),
    icon: batchNodeData.icon,
    mainColor: batchNodeData.mainColor,
  });
};
