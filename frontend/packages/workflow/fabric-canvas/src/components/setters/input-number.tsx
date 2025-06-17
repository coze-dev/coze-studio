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
