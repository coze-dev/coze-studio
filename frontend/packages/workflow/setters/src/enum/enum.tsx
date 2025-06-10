import React from 'react';

import cx from 'classnames';
import { Select } from '@coze/coze-design';

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
