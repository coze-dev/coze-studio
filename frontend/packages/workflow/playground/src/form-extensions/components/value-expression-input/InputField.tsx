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

import React, { type FC, type CSSProperties } from 'react';

import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { InputNumber, Switch, Input, DatePicker } from '@coze-arch/coze-design';
import { type SelectProps } from '@coze-arch/bot-semi/Select';

export type InputType =
  | ViewVariableType.String
  | ViewVariableType.Number
  | ViewVariableType.Integer
  | ViewVariableType.Boolean
  | ViewVariableType.Voice
  | ViewVariableType.Image
  | ViewVariableType.Time;

interface InputValueMap {
  [ViewVariableType.String]: string;
  [ViewVariableType.Number]: number;
  [ViewVariableType.Integer]: number;
  [ViewVariableType.Boolean]: boolean;
  [ViewVariableType.Image]: string;
  [ViewVariableType.Time]: string;
}
export type InputValueType =
  | InputValueMap[ViewVariableType.String]
  | InputValueMap[ViewVariableType.Number]
  | InputValueMap[ViewVariableType.Integer]
  | InputValueMap[ViewVariableType.Boolean]
  | InputValueMap[ViewVariableType.Image]
  | InputValueMap[ViewVariableType.Time]
  | Array<unknown>;

interface InputFieldProps {
  testId?: string;
  inputType?: InputType;
  disabled?: boolean;
  value?: InputValueType;
  style?: CSSProperties;
  onChange?: (value?: InputValueType) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  validateStatus?: SelectProps['validateStatus'];
  config?: {
    min?: number;
    max?: number;
  };
  placeholder?: string;
}

export const InputField: FC<InputFieldProps> = props => {
  const {
    inputType = ViewVariableType.String,
    value,
    onChange,
    onBlur,
    disabled,
    validateStatus,
    style,
    testId,
    config = {},
    onFocus,
    placeholder,
  } = props;

  const { min, max } = config;

  if (inputType === ViewVariableType.String) {
    return (
      <Input
        data-testid={testId}
        disabled={disabled}
        value={value as string}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={
          placeholder || I18n.t('workflow_detail_node_input_selectvalue')
        }
        validateStatus={validateStatus}
        style={style}
        size="small"
      />
    );
  }
  if (
    inputType === ViewVariableType.Integer ||
    inputType === ViewVariableType.Number
  ) {
    return (
      <InputNumber
        data-testid={testId}
        disabled={disabled}
        value={value as number}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={
          placeholder || I18n.t('workflow_detail_node_input_selectvalue')
        }
        validateStatus={validateStatus}
        style={style}
        min={min}
        max={max}
        size="small"
      />
    );
  }
  if (inputType === ViewVariableType.Boolean) {
    return (
      <Switch
        size="mini"
        data-testid={testId}
        disabled={disabled}
        checked={!!value}
        onChange={onChange}
        style={{
          marginLeft: 8,
        }}
      />
    );
  }

  if (inputType === ViewVariableType.Time) {
    console.info(value);
    return (
      <DatePicker
        className="w-full border-none [&_.semi-select]:!bg-transparent"
        type="dateTime"
        size="small"
        data-testid={testId}
        disabled={disabled}
        value={value as string}
        format="yyyy-MM-dd HH:mm:ss"
        onChange={(date, dateString) => {
          if (typeof dateString === 'string') {
            onChange?.(dateString);
          }
        }}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        inputStyle={{
          border: 'none',
          width: '100%',
        }}
        showClear={true}
        onClear={() => onChange?.('')}
      />
    );
  }

  return <div>InputField</div>;
};
