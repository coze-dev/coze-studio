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

import { DatePicker } from '@coze-arch/coze-design';

import { type DefaultValueInputProps } from './types';

export function InputTime({
  defaultValue,
  className,
  disabled,
  onBlur,
}: DefaultValueInputProps) {
  defaultValue =
    typeof defaultValue === 'string' &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(defaultValue)
      ? defaultValue
      : '';

  return (
    <DatePicker
      className={`${className} rounded-[8px]`}
      inputStyle={{ width: '100%' }}
      type="dateTime"
      size="small"
      defaultValue={defaultValue}
      disabled={disabled}
      format="yyyy-MM-dd HH:mm:ss"
      onChange={(date, dateString) => {
        // onBlur will only trigger the save.
        if (typeof dateString === 'string' || dateString === undefined) {
          onBlur?.(dateString);
        }
      }}
      onClear={() => {
        onBlur?.('');
      }}
      showClear={true}
    />
  );
}
