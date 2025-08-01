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
