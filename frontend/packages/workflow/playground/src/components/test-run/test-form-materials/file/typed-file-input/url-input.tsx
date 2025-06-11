import React, { useRef } from 'react';

import { Input } from '@coze/coze-design';

import { type BaseFileProps } from '../types';
import { JsonEditorAdapter } from '../../json-editor';

const URLInput: React.FC<BaseFileProps> = props => {
  const { onChange, disabled, multiple, value, onBlur, inputURLClassName } =
    props;

  const valueRef = useRef<string | undefined>(value);

  if (multiple) {
    return (
      <JsonEditorAdapter
        value={value}
        onChange={val => {
          valueRef.current = val;
          onChange?.(val);
        }}
        disabled={disabled}
        onBlur={() => {
          if (!valueRef.current) {
            onChange?.('[]');
          }

          onBlur?.();
        }}
      />
    );
  }

  return (
    <div className={inputURLClassName}>
      <Input
        value={value}
        onChange={v => {
          onChange?.(v === '' ? undefined : v);
        }}
        onBlur={onBlur}
        disabled={disabled}
        size="small"
      />
    </div>
  );
};

export { URLInput };
