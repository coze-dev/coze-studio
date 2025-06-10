import React from 'react';

import { InputNumber, Slider } from '@coze-arch/bot-semi';

import styles from './index.module.less';

interface SliderSettingProps {
  min: number;
  max: number;
  step: number;
  precision: number;
  value: number;
  marks: Record<number, string>;
  onChange: (value: number) => void;
  disabled: boolean;
}

export const SliderSetting = ({
  min = 0,
  max = 100,
  step = 1,
  precision = 0,
  value,
  marks,
  onChange,
  disabled,
}: SliderSettingProps) => (
  <div className={styles['slider-area']}>
    <div className={styles['slider-wrapper']}>
      <div className={styles.slider}>
        <Slider
          step={step}
          min={min}
          max={max}
          value={value}
          marks={marks}
          disabled={disabled}
          onChange={v => onChange(v as number)}
        ></Slider>
      </div>
      <InputNumber
        className={styles['input-number']}
        step={step}
        precision={precision}
        onChange={v => {
          let inputValue = Number(v);
          if (isNaN(inputValue)) {
            inputValue = value;
          } else {
            inputValue = inputValue || value;
            inputValue = Math.max(inputValue, 0);
          }
          if (inputValue > max) {
            inputValue = max;
          }
          onChange(inputValue);
        }}
        value={value}
        min={min}
        max={max}
        disabled={disabled}
      />
    </div>
    <div className={styles['slider-boundary']}>
      <div className={styles.min}>{min}</div>
      <div className={styles.max}>{max}</div>
    </div>
  </div>
);
