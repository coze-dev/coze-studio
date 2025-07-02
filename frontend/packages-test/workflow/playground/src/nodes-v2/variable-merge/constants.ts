import { ViewVariableType } from '@coze-workflow/base';

export const GROUP_NAME_PREFIX = 'Group';

export const MATCHED_VARIABLE_TYPES: ViewVariableType[][] = [
  [ViewVariableType.Number, ViewVariableType.Integer],
];

/**
 * 分组名最大数量
 */
export const MAX_GROUP_NAME_COUNT = 20;
/**
 * 分组最大数量
 */
export const MAX_GROUP_COUNT = 50;
/**
 * 分组变量最大数量
 */
export const MAX_GROUP_VARIABLE_COUNT = 50;
