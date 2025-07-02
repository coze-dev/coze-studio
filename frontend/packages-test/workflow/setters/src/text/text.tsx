import React from 'react';

import cx from 'classnames';
import { TextArea } from '@coze-arch/coze-design';

import { type Setter } from '../types';

import styles from './text.module.less';

export interface TextOptions {
  placeholder?: string;
  width?: number | string;
  maxCount?: number;
}

export const Text: Setter<string, TextOptions> = ({
  value,
  onChange,
  readonly = false,
  width = '100%',
  placeholder,
  maxCount,
}) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  return (
    <TextArea
      className={cx({ [styles.readonly]: readonly })}
      style={{
        width,
      }}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={maxCount}
      maxCount={maxCount}
    />
  );
};
