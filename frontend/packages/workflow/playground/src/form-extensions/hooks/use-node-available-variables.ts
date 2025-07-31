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

import { useEffect } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useRefresh, useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowVariable,
  useAvailableWorkflowVariables,
  getGlobalVariableAlias,
} from '@coze-workflow/variable';
import { WorkflowNodesService } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { type VariableMetaWithNode } from '../typings';

export const useNodeServiceAndRefreshForTitleChange = () => {
  const nodesService = useService<WorkflowNodesService>(WorkflowNodesService);
  const doc = useService<WorkflowDocument>(WorkflowDocument);
  const refresh = useRefresh();

  useEffect(() => {
    const dipose = nodesService.onNodesTitleChange(() => refresh());
    // Wait until the document is loaded and rehaje is rendered before you can get the title data.
    const dispose2 = doc.onLoaded(() => refresh());
    return () => {
      dipose.dispose();
      dispose2.dispose();
    };
  }, []);

  const getNodeInfoInVariableMeta = (node: FlowNodeEntity) => {
    const nodeTitle = nodesService.getNodeTitle(node);

    const info = {
      nodeTitle,
      nodeId: node.id,
      nodeType: node.flowNodeType
        ? (String(node.flowNodeType) as StandardNodeType)
        : undefined,
    };

    return info;
  };

  return { nodesService, getNodeInfoInVariableMeta };
};

export const useNodeAvailableVariablesWithNode =
  (): Array<VariableMetaWithNode> => {
    const variables: WorkflowVariable[] = useAvailableWorkflowVariables();
    const { getNodeInfoInVariableMeta } =
      useNodeServiceAndRefreshForTitleChange();

    return variables
      .map(variable => {
        if (!variable.viewMeta) {
          return;
        }

        return {
          ...variable.viewMeta,
          ...(variable.node
            ? getNodeInfoInVariableMeta(variable.node)
            : {
                nodeTitle: getGlobalVariableAlias(variable.globalVariableKey),
                nodeId: variable.globalVariableKey,
              }),
        };
      })
      .filter(Boolean) as Array<VariableMetaWithNode>;
  };
