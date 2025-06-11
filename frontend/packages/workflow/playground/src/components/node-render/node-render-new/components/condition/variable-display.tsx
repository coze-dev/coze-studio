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
