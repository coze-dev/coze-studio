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

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowVariableFacade } from '@coze-workflow/variable/src/core/workflow-variable-facade';
import { TRANS_WORKFLOW_VARIABLE_SOURCE } from '@coze-workflow/variable';

import { type VariableWithNodeInfo } from '../../components/variable-support/types';

interface ViewMetaWithUniqKey {
  children: ViewMetaWithUniqKey[];
  key: string;
}

export const getVariableFieldKeys = ({ variable }): string => {
  let keysString = '';

  function traverse(obj: ViewMetaWithUniqKey) {
    if (obj?.key) {
      keysString += `${obj.key} `;
    }
    if (obj?.children && obj?.children?.length > 0) {
      obj.children.forEach(child => traverse(child));
    }
  }

  traverse(variable?.viewMetaWithUniqKey);
  return keysString;
};

export function useVariableWithNodeInfo(
  variables: WorkflowVariableFacade[],
  getNodeInfoInVariableMeta,
): VariableWithNodeInfo[] {
  return variables.map(variable => {
    const nodeEntity: FlowNodeEntity = variable.node;
    const nodeId = variable.groupInfo.key;
    let nodeTitle = variable.groupInfo.label;
    const iconUrl = variable.groupInfo.icon;
    if (!variable.globalVariableKey) {
      // The node name obtained here is the latest
      const variableMeta = getNodeInfoInVariableMeta(nodeEntity);
      nodeTitle = variableMeta?.nodeTitle ?? '';
    }

    // Process variable specialization logic because block-output is not a valid variable name
    const source = variable.globalVariableKey
      ? variable.expressionPath.source
      : TRANS_WORKFLOW_VARIABLE_SOURCE +
        (variable.expressionPath.keyPath?.[0] ?? '');

    return {
      keyString: getVariableFieldKeys({ variable }),
      expressionPath: {
        ...variable.expressionPath,
        source,
      },
      nodeId,
      iconUrl,
      nodeTitle,
      globalVariableKey: variable.globalVariableKey ?? '',
    };
  });
}
