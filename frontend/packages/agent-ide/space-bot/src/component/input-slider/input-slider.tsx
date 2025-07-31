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

import React, { type FC } from 'react';

import { isInteger, isNumber, isUndefined } from 'lodash-es';
import classNames from 'classnames';
import { type SliderProps } from '@coze-arch/bot-semi/Slider';
import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import { withField, InputNumber, Slider } from '@coze-arch/bot-semi';
import { IconMinus, IconPlus } from '@douyinfe/semi-icons';

import { RCSliderWrapper, type RCSliderProps } from '../rc-slider-wrapper';

import s from './index.module.less';

interface InputSliderProps {
  value?: number;
  onChange?: (v: number) => void;
  max?: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  decimalPlaces?: number;
  marks?: SliderProps['marks'];
  className?: string;

  /** Whether to use rc-slider to replace semi-slider? At present, there is an obvious bug in semi-slider. In the zoom scene, there is a problem with drag and drop positioning, which has been fed back and is waiting to be fixed. */
  useRcSlider?: boolean;
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

const BaseInputSlider: React.FC<InputSliderProps> = ({
  value,
  onChange,
  max = 1,
  min = 0,
  step = 1,
  disabled,
  decimalPlaces,
  marks,
  className,
  useRcSlider = false,
}) => {
  const onNumberChange = (numberValue: number) => {
    const formattedValue = formateDecimalPlacesNumber(
      numberValue,
      value,
      decimalPlaces,
    );
    onChange?.(formattedValue);
  };

  return (
    <div className={classNames(s['input-slider'], className)}>
      {useRcSlider ? (
        <RCSliderWrapper
          disabled={disabled}
          value={value}
          max={max}
          min={min}
          step={step}
          marks={marks as RCSliderProps['marks']}
          onChange={v => {
            if (typeof v === 'number') {
              onChange?.(v);
            }
          }}
        />
      ) : (
        <Slider
          className={s.slider}
          disabled={disabled}
          value={value}
          max={max}
          min={min}
          step={step}
          marks={marks}
          onChange={v => {
            if (typeof v === 'number') {
              onChange?.(v);
            }
          }}
        />
      )}
      <div style={{ position: 'relative', marginLeft: 24 }}>
        <IconMinus
          className={classNames(
            s['input-btn'],
            disabled && s['input-btn-disabled'],
          )}
          onClick={e => {
            e.stopPropagation();
            if (isNumber(value) && value <= min) {
              return;
            }
            if (!disabled && value !== undefined) {
              onNumberChange(value - step);
            }
          }}
        />
        <InputNumber
          className={s['input-number']}
          value={value}
          disabled={disabled}
          formatter={inputValue =>
            formateDecimalPlacesString(inputValue, value)
          }
          hideButtons
          onNumberChange={onNumberChange}
          max={max}
          min={min}
        />
        <IconPlus
          className={classNames(
            s['input-btn'],
            disabled && s['input-btn-disabled'],
          )}
          onClick={e => {
            if (isNumber(value) && value >= max) {
              return;
            }
            e.stopPropagation();
            if (!disabled && value !== undefined) {
              onNumberChange(value + step);
            }
          }}
        />
      </div>
    </div>
  );
};
export const InputSlider: FC<CommonFieldProps & InputSliderProps> =
  withField(BaseInputSlider);
