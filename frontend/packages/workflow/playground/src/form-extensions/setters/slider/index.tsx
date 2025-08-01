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

import { isNil } from 'lodash-es';
import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';
import { Slider as UISlider } from '@coze-arch/coze-design';

type SelectProps = SetterComponentProps;

export const Slider = ({ value, onChange, options, readonly }: SelectProps) => {
  const { max, min, step, marks } = options;
  const { getNodeSetterId } = useNodeTestId();

  return (
    <div className="pb-1">
      <UISlider
        data-testid={getNodeSetterId('slider')}
        marks={marks}
        step={step}
        max={max}
        min={min}
        value={isNil(value) ? undefined : Number(value)}
        onChange={val => onChange(val)}
        readonly={readonly}
        disabled={readonly}
      />
    </div>
  );
};

export const slider: SetterExtension = {
  key: 'Slider',
  component: Slider,
};
