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
