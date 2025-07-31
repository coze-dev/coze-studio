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

import { type FC } from 'react';

import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { getGlobalVariableAlias } from '@coze-workflow/variable';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';

import { useAvailableNodeVariables } from '../../hooks/use-available-node-variables';
import { useValidVariable } from '../../fields/use-valid-variable';
import { ConditionTag } from './condition-tag';

export const VariableDisplay: FC<{
  keyPath?: string[];
}> = ({ keyPath }) => {
  const { variable: workflowVariable, valid } = useValidVariable(keyPath ?? []);
  const node = useCurrentEntity();
  useAvailableNodeVariables(node);

  if (!keyPath || !keyPath.length) {
    return null;
  }
  const nodeDataEntity =
    workflowVariable?.node?.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeData = nodeDataEntity?.getNodeData<keyof NodeData>();

  const globalVariableAlias = workflowVariable?.globalVariableKey
    ? getGlobalVariableAlias(workflowVariable?.globalVariableKey)
    : undefined;

  const variableText = nodeData?.title || globalVariableAlias;

  return (
    <ConditionTag
      invalid={!valid}
      tooltip={
        <span>
          <span>
            {variableText}
            <span className="mx-2">-</span>
          </span>
          {workflowVariable?.viewMeta?.name}
        </span>
      }
    >
      <span>
        {variableText}
        <span className="mx-2">-</span>
      </span>
      {workflowVariable?.viewMeta?.name}
    </ConditionTag>
  );
};
