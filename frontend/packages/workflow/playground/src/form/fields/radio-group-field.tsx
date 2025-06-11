import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import {
  Radio,
  RadioGroup,
  type RadioGroupProps as BaseRadioGroupProps,
} from '@coze/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';
import { type FieldProps } from '../components';

type RadioGroupGroup = Omit<
  BaseRadioGroupProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const RadioGroupField: React.FC<RadioGroupGroup & FieldProps> =
  withField<RadioGroupGroup>(props => {
    const { name, value, onChange, readonly } = useField<string>();
    const { options, ...rest } = props;

    const { getNodeSetterId, concatTestId } = useNodeTestId();

    return (
      <RadioGroup
        {...rest}
        value={value}
        disabled={!!readonly}
        onChange={e => onChange(e.target.value)}
      >
        {options?.map(item => (
          <Radio
            className={item.className}
            value={item.value}
            data-testid={concatTestId(getNodeSetterId(name), `${item.value}`)}
          >
            {item.label}
          </Radio>
        ))}
      </RadioGroup>
    );
  });
