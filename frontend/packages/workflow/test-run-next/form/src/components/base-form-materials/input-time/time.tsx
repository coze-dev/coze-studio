import React from 'react';

import { clsx } from 'clsx';
import { DatePicker } from '@coze/coze-design';

import css from './time.module.less';

export interface InputTimeProps {
  className?: string;
  value?: string;
  onChange?: (v?: string) => void;
}

export const InputTime: React.FC<InputTimeProps> = ({
  className,
  value,
  onChange,
  ...props
}) => (
  <DatePicker
    className={clsx(css['input-time'], className)}
    type="dateTime"
    size="small"
    showClear={false}
    showSuffix={false}
    value={value}
    onChange={(_date, dateString) => {
      if (typeof dateString === 'string' || dateString === undefined) {
        onChange?.(dateString);
      }
    }}
    {...props}
  />
);
