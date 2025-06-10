import {
  type DatabaseConditionRight,
  type DatabaseConditionOperator,
  type ViewVariableType,
} from '@coze-workflow/base';
import { Input } from '@coze/coze-design';

import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import { withField, useField } from '@/form';

interface ConditionRightFieldProps {
  operation?: DatabaseConditionOperator;
  dataType?: ViewVariableType;
}

export const ConditionRightField = withField(
  ({ operation, dataType }: ConditionRightFieldProps) => {
    const { name, value, onChange, readonly } =
      useField<DatabaseConditionRight>();

    if (operation === 'IS_NULL' || operation === 'IS_NOT_NULL') {
      return <Input value={'empty'} disabled size="small" />;
    }

    if (operation === 'BE_TRUE') {
      return <Input value={'true'} disabled size="small" />;
    }

    if (operation === 'BE_FALSE') {
      return <Input value={'false'} disabled size="small" />;
    }

    return (
      <ValueExpressionInput
        name={name}
        value={value}
        inputType={dataType}
        readonly={readonly}
        onChange={newValue => {
          onChange(newValue as DatabaseConditionRight);
        }}
      />
    );
  },
);
