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

import cx from 'classnames';
import { Select } from '@coze-arch/coze-design';

import { type Setter } from '../types';
import { type Value, type EnumImageModelOptions } from './types';
import { EnumImageModelLabel } from './enum-image-model-label';

import styles from './enum-image-model.module.less';

export const EnumImageModel: Setter<Value, EnumImageModelOptions> = ({
  value,
  onChange,
  readonly = false,
  width = '100%',
  showClear = false,
  placeholder = '',
  options,
  validateStatus,
}) => (
  <Select
    size="small"
    className={cx('flex', {
      [styles.select]: true,
      [styles.readonly]: readonly,
    })}
    optionList={options.map(
      ({ label, value: optionValue, thumbnail, disabled, tooltip }) => ({
        label: (
          <EnumImageModelLabel
            thumbnail={thumbnail}
            label={label}
            tooltip={tooltip}
            disabled={disabled}
          />
        ),
        value: optionValue,
        disabled,
      }),
    )}
    style={{ width }}
    value={value}
    onChange={v => onChange?.(v as Value)}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderSelectedItem={({ value: selectedValue }: any) => {
      const option = options.find(item => item.value === selectedValue);

      if (option) {
        const { thumbnail, label } = option;
        return <EnumImageModelLabel thumbnail={thumbnail} label={label} />;
      }

      return null;
    }}
    showClear={showClear}
    onClear={() => {
      onChange?.(undefined);
    }}
    placeholder={placeholder}
    validateStatus={validateStatus}
  />
);
