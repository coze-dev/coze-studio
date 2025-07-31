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

import { type CSSProperties } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { Slider } from '@coze-arch/coze-design';

export const SliderWithInput = (props: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  min: number;
  sliderStyle?: CSSProperties;
  inputStyle?: CSSProperties;
  readonly: boolean;
  marks?: {
    [key: number]: string;
  };
}) => {
  const {
    value,
    onChange,
    max,
    min,
    sliderStyle = { width: 300 },
    readonly,
    marks,
  } = props;

  const { getNodeSetterId } = useNodeTestId();

  return (
    <div className="flex">
      <Slider
        data-testid={getNodeSetterId('slider-with-input-slider')}
        max={max}
        min={min}
        value={value}
        onChange={val => {
          onChange(val as number);
        }}
        style={sliderStyle}
        readonly={readonly}
        disabled={readonly}
        marks={marks}
      />
    </div>
  );
};
