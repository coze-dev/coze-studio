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

import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { type LiteralValueInputProps } from './type';

import styles from './styles.module.less';
export const InputBoolean: FC<LiteralValueInputProps> = ({
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
  const val = defaultValue ?? value;
  const valueRef = useRef(val as boolean | undefined | null);
  const handleChange = newVal => {
    if (newVal) {
      const parsed = JSON.parse(newVal || 'false') as boolean;
      onChange?.(parsed);
      valueRef.current = parsed;
    } else {
      onChange?.(null);
      valueRef.current = null;
    }
  };
  return (
    <div className={styles['input-boolean-wrapper']}>
      <Select
        className={className}
        data-testid={testId}
        placeholder={
          placeholder || I18n.t('workflow_detail_node_input_entervalue')
        }
        size="small"
        optionList={[
          {
            label: 'true',
            value: 'true',
          },
          {
            label: 'false',
            value: 'false',
          },
        ]}
        showClear
        defaultValue={val !== undefined ? JSON.stringify(val) : undefined}
        disabled={disabled}
        validateStatus={validateStatus}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={() => onBlur?.(valueRef.current)}
        style={style}
      />
    </div>
  );
};
