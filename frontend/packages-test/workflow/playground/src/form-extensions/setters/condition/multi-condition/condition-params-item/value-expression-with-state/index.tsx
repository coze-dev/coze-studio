/* eslint-disable @coze-arch/no-deep-relative-import */
/**
 * 交互上，当选择了运算符后，右值在 disabled/disabled 切换的时候，需要保持类型和上次的一致，所以这里做一下状态存储
 */
import React, { type FC, useEffect, useState } from 'react';

import { ConditionType } from '@coze-arch/idl/workflow_api';
import { Input } from '@coze-arch/coze-design';

import {
  ValueExpressionInput,
  type ValueExpressionInputProps,
} from '../../../../../components/value-expression-input';

export const ValueExpressionWithState: FC<
  ValueExpressionInputProps & {
    operator?: ConditionType;
  }
> = props => {
  const { value, operator } = props;

  const [valueType, setValueType] = useState(value?.type);

  useEffect(() => {
    if (value?.type) {
      setValueType(value?.type);
    }
  }, [value?.type]);

  if (
    operator &&
    [ConditionType.Null, ConditionType.NotNull].includes(operator)
  ) {
    return <Input disabled value="empty" size="small" />;
  }
  if (
    operator &&
    [ConditionType.True, ConditionType.False].includes(operator)
  ) {
    if (operator === ConditionType.True) {
      return <Input disabled value="true" size="small" />;
    } else {
      return <Input disabled value="false" size="small" />;
    }
  }

  return (
    <ValueExpressionInput
      {...props}
      value={value ?? (valueType ? { type: valueType } : undefined)}
    />
  );
};
