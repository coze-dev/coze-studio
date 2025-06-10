import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowVariableService } from '@coze-workflow/variable';

import { type MergeGroup } from '../types';
import { getVariableTypeAlias } from './get-variable-type-alias';

/**
 * 获取分组类型别名
 */
export function getGroupTypeAlias(
  mergeGroup: MergeGroup,
  variableService: WorkflowVariableService,
  node: WorkflowNodeEntity,
) {
  return getVariableTypeAlias(
    mergeGroup?.variables?.[0],
    variableService,
    node,
  );
}
