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

import React, { useRef } from 'react';

import { Input } from '@coze-arch/coze-design';

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
