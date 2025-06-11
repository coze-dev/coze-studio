import React from 'react';

import RcSlider, { type SliderProps } from 'rc-slider';

import 'rc-slider/assets/index.css';
import { handleRender } from './handle-render';

import styles from './index.module.less';

interface InputSliderProps {
  value?: number;
  onChange?: (v: number) => void;
  max?: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  useRcSlider?: boolean;
  marks?: SliderProps['marks'];
  tipFormatter?: (
    value: string | number | boolean | (string | number | boolean)[],
  ) => string;
  handleRender?: SliderProps['handleRender'];
}

export type RCSliderProps = SliderProps;

export const RCSliderWrapper: React.FC<InputSliderProps> = props => {
  const {
    value,
    onChange,
    max = 1,
    min = 0,
    step = 1,
    disabled,
    marks,
    className,
  } = props;

  return (
    <div className={styles['rc-slider-wrapper']}>
      <RcSlider
        className={className}
        disabled={disabled}
        value={value}
        max={max}
        min={min}
        step={step}
        marks={marks}
        handleRender={handleRender}
        onChange={v => {
          if (typeof v === 'number') {
            onChange?.(v);
          }
        }}
      />
    </div>
  );
};
