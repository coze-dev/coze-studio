/* eslint-disable @typescript-eslint/no-empty-interface */
import { type RefExpression, useNodeTestId } from '@coze-workflow/base';

import { LoopOutputSelect } from '@/form-extensions/components/loop-output-select';
import { useField, withField } from '@/form';

interface LoopOutputSelectFieldProps {}

export const LoopOutputSelectField = withField<
  LoopOutputSelectFieldProps,
  RefExpression
>(() => {
  const { name, value, onChange, readonly } = useField<RefExpression>();
  const { getNodeSetterId } = useNodeTestId();
  const testId = getNodeSetterId(name);

  return (
    <LoopOutputSelect
      value={value}
      onChange={onChange}
      readonly={readonly}
      testId={testId}
    />
  );
});
