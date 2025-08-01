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

import { type FC, useRef } from 'react';

import classNames from 'classnames';
import { DatePicker } from '@coze-arch/coze-design';

import { type LiteralValueInputProps } from './type';

import styles from './styles.module.less';

export const InputTime: FC<LiteralValueInputProps> = ({
  value,
  defaultValue,
  disabled,
  testId,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  validateStatus,
  style,
  className,
}) => {
  defaultValue =
    typeof defaultValue === 'string' &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(defaultValue)
      ? defaultValue
      : '';

  const val = defaultValue ?? value;
  const valueRef = useRef(val as string | undefined | null);

  const handleChange = (newVal?: string) => {
    onChange?.(newVal);
    valueRef.current = newVal;
  };

  return (
    <DatePicker
      className={classNames(className, styles['input-time'])}
      data-testid={testId}
      inputStyle={{ width: '100%' }}
      type="dateTime"
      size="small"
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value as string}
      disabled={disabled}
      format="yyyy-MM-dd HH:mm:ss"
      validateStatus={validateStatus}
      onFocus={onFocus}
      onChange={(date, dateString) => {
        if (typeof dateString === 'string' || dateString === undefined) {
          handleChange(dateString);
        }
      }}
      onClear={() => {
        handleChange('');
        onBlur?.('');
      }}
      onBlur={() => {
        onBlur?.(valueRef.current);
      }}
      showClear={true}
      style={style}
    />
  );
};
