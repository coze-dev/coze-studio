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
      // 流程变量特化逻辑，因为 block-output 不是一个合法的变量名
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
