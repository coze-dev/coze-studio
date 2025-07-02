import {
  type ConditionOperator,
  type DatabaseConditionRight,
} from '@coze-workflow/base';

import { ConditionTag, ExpressionDisplay } from '../../components/condition';

export function DatabaseConditionRightComponent({
  value,
  operator,
}: {
  value?: DatabaseConditionRight;
  operator?: ConditionOperator;
}) {
  const rightTextMap = {
    IS_NULL: 'Empty',
    IS_NOT_NULL: 'Empty',
    BE_TRUE: 'true',
    BE_FALSE: 'false',
  };

  if (operator && rightTextMap[operator]) {
    return <ConditionTag>{rightTextMap[operator]}</ConditionTag>;
  }

  if (!value) {
    return null;
  }

  return <ExpressionDisplay value={value} />;
}
