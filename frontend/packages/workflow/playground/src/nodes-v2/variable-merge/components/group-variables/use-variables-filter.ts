import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  ViewVariableType,
  type RefExpression,
  ValueExpression,
} from '@coze-workflow/base';

import { useVariableService } from '@/hooks';
import { type CustomFilterVar } from '@/form-extensions/components/tree-variable-selector/types';

import { getVariableViewType } from '../../utils/get-variable-view-type';
import { getMatchedVariableTypes } from '../../utils/get-matched-variable-types';
/**
 * 变量过滤
 */
export const useVariablesFilter = (
  variables: ValueExpression[],
): {
  customFilterVar: CustomFilterVar;
  disabledTypes: ViewVariableType[];
  viewType?: ViewVariableType;
} => {
  const variableService = useVariableService();
  const node = useCurrentEntity();
  const viewType = getVariableViewType(
    variables[0] as RefExpression,
    variableService,
    node,
  );

  // 只允许选择和第一个变量相同类型的变量
  const matchedTypes = getMatchedVariableTypes(viewType);
  const disabledTypes =
    matchedTypes.length > 0 ? ViewVariableType.getComplement(matchedTypes) : [];

  const paths = variables
    .filter(variable => ValueExpression.isRef(variable))
    .map(variable => variable.content?.keyPath)
    .filter(Boolean)
    .map(path => (path as string[]).join('.'));

  // 已经选择的变量不允许再选择
  const customFilterVar: CustomFilterVar = ({ meta: _meta, path }) =>
    !paths.includes((path || []).join('.'));

  return {
    customFilterVar,
    disabledTypes,
    viewType,
  };
};
