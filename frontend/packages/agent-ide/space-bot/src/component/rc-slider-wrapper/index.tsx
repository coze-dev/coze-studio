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
