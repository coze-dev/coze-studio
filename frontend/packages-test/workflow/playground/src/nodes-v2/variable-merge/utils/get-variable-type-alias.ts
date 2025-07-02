import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowVariableService } from '@coze-workflow/variable';
import {
  type ValueExpression,
  VARIABLE_TYPE_ALIAS_MAP,
} from '@coze-workflow/base';

import { getVariableViewType } from './get-variable-view-type';

/**
 * 获取变量别名
 */
export function getVariableTypeAlias(
  variable: ValueExpression | undefined,
  variableService: WorkflowVariableService,
  node: WorkflowNodeEntity,
) {
  const viewType = getVariableViewType(variable, variableService, node);

  if (!viewType) {
    return '';
  }

  return VARIABLE_TYPE_ALIAS_MAP[viewType] || '';
}
