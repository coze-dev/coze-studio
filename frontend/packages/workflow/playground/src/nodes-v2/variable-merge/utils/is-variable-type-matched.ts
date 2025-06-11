import { type ViewVariableType } from '@coze-workflow/base';

import { getMatchedVariableTypes } from './get-matched-variable-types';

/**
 * 变量类型是否匹配
 * @param viewType1
 * @param viewType2
 * @returns
 */
export function isVariableTypeMatched(
  viewType1: ViewVariableType,
  viewType2: ViewVariableType,
) {
  return getMatchedVariableTypes(viewType1).includes(viewType2);
}
