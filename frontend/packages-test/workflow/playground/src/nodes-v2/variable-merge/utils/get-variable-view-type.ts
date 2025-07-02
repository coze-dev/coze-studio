import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowVariableService,
  variableUtils,
  type ValueExpression,
} from '@coze-workflow/variable';

/**
 * 获取变量类型
 */
export function getVariableViewType(
  variable: ValueExpression | undefined,
  variableService: WorkflowVariableService,
  node: WorkflowNodeEntity,
) {
  if (!variable) {
    return undefined;
  }
  return variableUtils.getValueExpressionViewType(variable, variableService, {
    node,
  });
}
