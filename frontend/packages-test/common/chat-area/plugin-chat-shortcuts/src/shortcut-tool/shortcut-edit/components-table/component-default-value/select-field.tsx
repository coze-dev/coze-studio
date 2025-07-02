import React, { type FC } from 'react';

import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import { Select, withField } from '@coze-arch/bot-semi';
import { InputType } from '@coze-arch/bot-api/playground_api';
type InputWithInputTypeProps = {
  value?: { type: InputType; value: string };
  onSelect?: (value: { type: InputType; value: string }) => void;
} & Omit<React.ComponentProps<typeof Select>, 'value' | 'onSelect'>;

const SelectWithInputType: FC<InputWithInputTypeProps> = props => {
  const { value, onSelect, ...rest } = props;
  return (
    <Select
      {...rest}
      showClear={!!value?.value}
      onClear={() => {
        onSelect?.({ type: InputType.TextInput, value: '' });
      }}
      value={value?.value}
      onSelect={selectValue => {
        const newValue = {
          type: value?.type || InputType.TextInput,
          value: selectValue as string,
        };
        onSelect?.(newValue);
        return newValue;
      }}
    />
  );
};

export const SelectWithInputTypeField: FC<
  InputWithInputTypeProps & CommonFieldProps
> = withField(SelectWithInputType, {
  valueKey: 'value',
  onKeyChangeFnName: 'onSelect',
});
