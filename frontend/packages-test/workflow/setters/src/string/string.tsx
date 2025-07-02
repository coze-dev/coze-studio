import React from 'react';

import cx from 'classnames';
import { Input } from '@coze-arch/coze-design';

import { type Setter } from '../types';

import styles from './string.module.less';

export interface StringOptions {
  placeholder?: string;
  width?: number | string;
  maxCount?: number;
  // 新增这个配置的原因是readonly样式带有输入框 有些场景需要只展示文本
  textMode?: boolean;
  testId?: string;
}

export const String: Setter<string, StringOptions> = ({
  value,
  onChange,
  readonly = false,
  width = 'auto',
  placeholder,
  maxCount,
  textMode = false,
  testId,
}) => {
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  if (textMode) {
    return (
      <div style={{ width }} className={styles['text-mode']}>
        {value}
      </div>
    );
  }

  return (
    <Input
      size="small"
      data-testid={testId}
      className={cx({
        [styles.readonly]: readonly,
      })}
      style={{
        width,
      }}
      value={value}
      onChange={handleChange}
      readonly={readonly}
      placeholder={placeholder}
      maxLength={maxCount}
      suffix={
        maxCount === undefined ? null : (
          <span className={styles.suffix}>
            {`${value?.length || 0}/${maxCount}`}
          </span>
        )
      }
    />
  );
};
