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
 
import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react';

import { InputProps } from '@douyinfe/semi-ui/lib/es/input';

import { Input } from '../ui-input';

export type UISearchInputProps = InputProps & {
  onSearch?: (value?: string) => void;
};

type InputRefType = HTMLInputElement | null;

/**
 * 搜索场景下的 Input 组件 结合 composition api 优化了中文输入场景
 * @returns Input
 */
export const UISearchInput = forwardRef(
  (
    {
      onSearch,
      onChange,
      onCompositionStart,
      onCompositionUpdate,
      onCompositionEnd,
      ...props
    }: UISearchInputProps,
    ref: ForwardedRef<InputRefType>,
  ) => {
    const compositionFlag = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle<InputRefType, InputRefType>(
      ref,
      () => inputRef.current,
    );

    return (
      <Input
        {...props}
        data-testid="ui.search-input"
        ref={inputRef}
        onChange={(...args) => {
          onChange?.(...args);
          if (!compositionFlag.current) {
            onSearch?.(args[0]);
          }
        }}
        onCompositionStart={(...args) => {
          onCompositionStart?.(...args);
          compositionFlag.current = true;
        }}
        onCompositionUpdate={(...args) => {
          onCompositionUpdate?.(...args);
          compositionFlag.current = true;
        }}
        onCompositionEnd={(...args) => {
          onCompositionEnd?.(...args);
          compositionFlag.current = false;
          onSearch?.(inputRef.current?.value);
        }}
      />
    );
  },
);
