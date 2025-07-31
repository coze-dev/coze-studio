/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import {
  Radio,
  RadioGroup,
  type RadioGroupProps as BaseRadioGroupProps,
} from '@coze-arch/coze-design';

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
