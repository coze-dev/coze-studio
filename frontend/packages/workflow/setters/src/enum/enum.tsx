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

import type { Setter } from '../types';
import type { Options, EnumValue } from './types';

import styles from './enum.module.less';

export interface EnumOptions {
  width?: number | string;
  placeholder?: string;
  options: Options;
}

export const Enum: Setter<EnumValue, EnumOptions> = ({
  value,
  onChange,
  readonly,
  options = [],
  placeholder,
  width = '100%',
}) => (
  <Select
    placeholder={placeholder}
    className={cx({ [styles.readonly]: readonly })}
    optionList={options}
    style={{ width }}
    value={value}
    onChange={v => onChange?.(v as EnumValue)}
  />
);
