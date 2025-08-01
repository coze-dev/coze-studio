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

import { useMemo } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { isApiNode, isSubWorkflowNode } from '@/services/node-version-service';

export const useNodeOrigin = (node: FlowNodeEntity) => {
  const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const isApi = useMemo(() => isApiNode(node), [node]);

  /**
   * Is it a reference node?
   */
  const isReference = useMemo(
    () => isApi || isSubWorkflowNode(node),
    [isApi, node],
  );

  /**
   * Is it from the project?
   * 1. Node has projectId
   */
  const isFromProject =
    isReference &&
    !!nodeData.getNodeData<StandardNodeType.SubWorkflow>().projectId;

  /**
   * Is it from the store?
   * 1. Plugin Node
   * 2. Nodes do not come from the project
   * 3. There is a shelf status
   */
  const isFromStore =
    isApi &&
    !isFromProject &&
    !!nodeData.getNodeData<StandardNodeType.Api>().pluginProductStatus;

  /**
   * Is it from the resource library?
   * 1. Nodes of reference type
   * 2. Not from the project or store
   */
  const isFromLibrary = isReference && !isFromProject && !isFromStore;

  return {
    isApi,
    isFromStore,
    isFromLibrary,
  };
};
