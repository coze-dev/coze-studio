import { type ConditionLogic, useNodeTestId } from '@coze-workflow/base';

import { withField, useField, type FieldProps } from '@/form';
import {
  ConditionItemLogic,
  type ConditionItemLogicProps,
} from '@/components/condition-item-logic';

export const ConditionLogicField = withField<
  Pick<ConditionItemLogicProps, 'showStroke'> & FieldProps
>(({ showStroke }) => {
  const { name, value, onChange, readonly } = useField<ConditionLogic>();
  const { getNodeSetterId } = useNodeTestId();

  return (
    <ConditionItemLogic
      logic={value}
      readonly={readonly}
      onChange={onChange}
      showStroke={showStroke}
      testId={getNodeSetterId(name)}
    />
  );
});
