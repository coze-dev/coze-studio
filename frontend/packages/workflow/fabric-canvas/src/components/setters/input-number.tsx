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
 
import { forwardRef } from 'react';

import {
  InputNumber as CozeInputNumber,
  type InputNumberProps,
} from '@coze-arch/coze-design';

export const InputNumber = forwardRef<InputNumberProps, InputNumberProps>(
  props => {
    const { onChange, min, max, value, ...rest } = props;
    return (
      <CozeInputNumber
        {...rest}
        min={min}
        max={max}
        value={value}
        // InputNumber 长按 + - 时，会一直触发变化。这里有 bug，有时定时器清不掉，会鬼畜（一直增加/减小）。
        // 把 pressInterval 设置成 24h ，变相禁用长按增减
        pressInterval={1000 * 60 * 60 * 24}
        onNumberChange={v => {
          if (Number.isFinite(v)) {
            if (typeof min === 'number' && (v as number) < min) {
              onChange?.(min);
            } else if (typeof max === 'number' && (v as number) > max) {
              onChange?.(max);
            } else {
              const _v = Number((v as number).toFixed(1));
              if (_v !== value) {
                onChange?.(Number((v as number).toFixed(1)));
              }
            }
          }
        }}
      />
    );
  },
);
