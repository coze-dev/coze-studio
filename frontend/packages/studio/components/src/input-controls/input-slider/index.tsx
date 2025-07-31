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

import { useEffect, useMemo, useRef, useState } from 'react';

import { nanoid } from 'nanoid';
import { isInteger, isUndefined } from 'lodash-es';
import classNames from 'classnames';
import { useHover } from 'ahooks';
import { InputNumber } from '@coze-arch/coze-design';
import { type SliderProps } from '@coze-arch/bot-semi/Slider';
import { Slider } from '@coze-arch/bot-semi';

import styles from './index.module.less';

export interface InputSliderProps {
  value?: number;
  onChange?: (v: number) => void;
  max?: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  decimalPlaces?: number;
  marks?: SliderProps['marks'];
  className?: string;
}
const POWVAL = 10;
const formateDecimalPlacesString = (
  value: string | number,
  prevValue?: number,
  decimalPlaces?: number,
) => {
  if (isUndefined(decimalPlaces)) {
    return value.toString();
  }
  const numberValue = Number(value);
  const stringValue = value.toString();
  if (Number.isNaN(numberValue)) {
    return `${value}`;
  }
  if (decimalPlaces === 0 && !isInteger(Number(value)) && prevValue) {
    return `${prevValue}`;
  }
  const decimalPointIndex = stringValue.indexOf('.');

  if (decimalPointIndex < 0) {
    return stringValue;
  }
  const formattedValue = stringValue.substring(
    0,
    decimalPointIndex + 1 + decimalPlaces,
  );

  if (formattedValue.endsWith('.') && decimalPlaces === 0) {
    return formattedValue.substring(0, formattedValue.length - 1);
  }
  return formattedValue;
};

const formateDecimalPlacesNumber = (
  value: number,
  prevValue?: number,
  decimalPlaces?: number,
) => {
  if (isUndefined(decimalPlaces)) {
    return value;
  }
  if (decimalPlaces === 0 && !isInteger(value) && prevValue) {
    return prevValue;
  }
  const pow = Math.pow(POWVAL, decimalPlaces);
  return Math.round(value * pow) / pow;
};

export const InputSlider: React.FC<InputSliderProps> = ({
  value,
  onChange,
  max = 1,
  min = 0,
  step = 1,
  disabled,
  decimalPlaces = 0,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const hover = useHover(ref);
  const sliderRenderId = useMemo(() => nanoid(), [max, min, hover]);
  const [isFocus, setFocus] = useState(false);
  const [inputRenderId, setInputRenderId] = useState(nanoid());
  const updateInputNumber = () => {
    if (isFocus) {
      return;
    }
    setInputRenderId(nanoid());
  };
  const onNumberChange = (numberValue: number) => {
    updateInputNumber();

    // Prevent -0
    if (numberValue === 0) {
      onChange?.(0);
      return;
    }

    const expectedFormattedValue = formateDecimalPlacesNumber(
      numberValue,
      value,
      decimalPlaces,
    );

    onChange?.(expectedFormattedValue);
  };

  // Prevent -0 from causing InputNumber to update indefinitely
  const fixedValue = Object.is(value, -0) ? 0 : value;

  useEffect(() => {
    updateInputNumber();
  }, [isFocus]);

  return (
    <div ref={ref} className={classNames(styles['input-slider'], className)}>
      <Slider
        key={sliderRenderId}
        className={styles.slider}
        disabled={disabled}
        value={fixedValue}
        max={max}
        min={min}
        step={step}
        showBoundary
        onChange={v => {
          if (typeof v === 'number') {
            onChange?.(v);
          }
        }}
      />
      <InputNumber
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        key={inputRenderId}
        className={styles['input-number']}
        value={fixedValue}
        disabled={disabled}
        formatter={inputValue => formateDecimalPlacesString(inputValue, value)}
        onNumberChange={onNumberChange}
        max={max}
        min={min}
        step={step}
      />
    </div>
  );
};
