import { type DatabaseConditionOperator } from '@coze-workflow/base';

import { ConditionOperatorMap } from '@/constants/condition-operator-map';

export function DatabaseConditionOperatorComponent({
  value,
}: {
  value?: DatabaseConditionOperator;
}) {
  return value ? ConditionOperatorMap[value].operationIcon : null;
}
