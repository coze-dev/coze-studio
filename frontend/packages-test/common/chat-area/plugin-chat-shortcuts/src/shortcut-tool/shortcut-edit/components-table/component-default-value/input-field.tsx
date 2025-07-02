import React, { type FC } from 'react';

import type { InputProps } from '@coze-arch/bot-semi/Input';
import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import { UIInput, withField } from '@coze-arch/bot-semi';
import { InputType } from '@coze-arch/bot-api/playground_api';

type InputWithInputTypeProps = {
  value?: { type: InputType; value: string };
  onChange?: (value: { type: InputType; value: string }) => void;
} & Omit<InputProps, 'value'>;

const MaxLength = 100;

const InputWithInputType: FC<InputWithInputTypeProps> = props => {
  const { value, onChange, ...rest } = props;
  return (
    <UIInput
      value={value?.value}
      {...rest}
      maxLength={MaxLength}
      onChange={inputValue => {
        const newValue = {
          type: value?.type || InputType.TextInput,
          value: inputValue,
        };
        onChange?.(newValue);
        return newValue;
      }}
    />
  );
};

export const InputWithInputTypeField: FC<
  InputWithInputTypeProps & CommonFieldProps
> = withField(InputWithInputType, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});
