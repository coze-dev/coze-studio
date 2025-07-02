import { ViewVariableType } from '@coze-workflow/base';
import { type ConditionOperator } from '@coze-workflow/base';

import { ConditionOperatorMap } from '@/constants/condition-operator-map';

export function getConditionOperatorOptions(fieldType?: ViewVariableType) {
  let supportedOperators: ConditionOperator[] = [];

  if (
    fieldType === ViewVariableType.Number ||
    fieldType === ViewVariableType.Integer
  ) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'GREATER_THAN',
      'LESS_THAN',
      'GREATER_EQUAL',
      'LESS_EQUAL',
      'IN',
      'NOT_IN',
      'IS_NULL',
      'IS_NOT_NULL',
    ];
  }

  if (fieldType === ViewVariableType.String) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'LIKE',
      'NOT_LIKE',
      'IN',
      'NOT_IN',
      'IS_NULL',
      'IS_NOT_NULL',
    ];
  }

  if (fieldType === ViewVariableType.Time) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'GREATER_THAN',
      'LESS_THAN',
      'GREATER_EQUAL',
      'LESS_EQUAL',
      'IS_NULL',
      'IS_NOT_NULL',
    ];
  }

  if (fieldType === ViewVariableType.Boolean) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'IS_NULL',
      'IS_NOT_NULL',
      'BE_TRUE',
      'BE_FALSE',
    ];
  }

  return supportedOperators.map(operator => ({
    label: ConditionOperatorMap[operator].label,
    value: operator,
    operationIcon: ConditionOperatorMap[operator].operationIcon,
  }));
}
