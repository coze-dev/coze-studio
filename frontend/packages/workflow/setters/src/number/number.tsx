import React from 'react';

import cx from 'classnames';
import { CozInputNumber, Slider } from '@coze/coze-design';

import type { Setter } from '../types';

import styles from './number.module.less';

export interface NumberOptions {
  placeholder?: string;
  width?: number | string;
  step?: number;
  max?: number;
  min?: number;
  mode?: 'input' | 'slider';
  size?: 'small' | 'default';
  style?: React.CSSProperties;
}

export const Number: Setter<number, NumberOptions> = ({
  value,
  onChange,
  width = '100%',
  readonly = false,
  mode = 'input',
  max,
  min,
  step,
  placeholder,
  size = 'default',
  style = {},
}) => {
  const handleChange = (newValue: number | string) => {
    if (typeof newValue === 'number' && !readonly) {
      onChange?.(newValue);
    }
  };

  const handleSliderChange = (newValue?: number | number[]) => {
    if (typeof newValue === 'number' && !readonly) {
      onChange?.(newValue);
    }
  };

  if (mode === 'slider') {
    return (
      <div className={styles.slider} style={{ width, ...style }}>
        <Slider
          className={cx({ [styles.readonly]: readonly })}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleSliderChange}
        />
      </div>
    );
  }

  return (
    <CozInputNumber
      value={value}
      onChange={handleChange}
      className={cx({ [styles.readonly]: readonly })}
      style={{ width, ...style }}
      max={max}
      min={min}
      step={step}
      placeholder={placeholder}
      size={size}
    />
  );
};
