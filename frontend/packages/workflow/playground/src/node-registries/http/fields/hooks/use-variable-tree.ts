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

import {
  type ExpressionEditorTreeNode,
  ExpressionEditorTreeHelper,
} from '@coze-workflow/components';
import { type WorkflowVariableFacade } from '@coze-workflow/variable/src/core/workflow-variable-facade';
import {
  getGlobalVariableAlias,
  TRANS_WORKFLOW_VARIABLE_SOURCE,
} from '@coze-workflow/variable';

export const useVariableTree = ({
  variables,
  getNodeInfoInVariableMeta,
}): ExpressionEditorTreeNode[] => {
  const availableVariables: ExpressionEditorTreeHelper.AvailableVariable[] =
    variables.map((variable: WorkflowVariableFacade) => ({
      // Process variable specialization logic because block-output is not a valid variable name
      name: variable.globalVariableKey
        ? variable.expressionPath?.source
        : TRANS_WORKFLOW_VARIABLE_SOURCE +
          variable.expressionPath?.keyPath?.[0],
      keyPath: [variable.expressionPath?.keyPath?.[0]],
      variable: variable.viewMeta
        ? {
            ...variable.viewMeta,
            ...(variable.node
              ? getNodeInfoInVariableMeta(variable.node)
              : {
                  nodeTitle: getGlobalVariableAlias(variable.globalVariableKey),
                  nodeId: variable.globalVariableKey,
                }),
            children: [
              {
                ...variable.viewMeta,
                ...(variable.node
                  ? getNodeInfoInVariableMeta(variable.node)
                  : {
                      nodeTitle: getGlobalVariableAlias(
                        variable.globalVariableKey,
                      ),
                      nodeId: variable.globalVariableKey,
                    }),
              },
            ],
          }
        : undefined,
    }));

  const variableTree =
    ExpressionEditorTreeHelper.createVariableTree(availableVariables);
  return variableTree;
};
