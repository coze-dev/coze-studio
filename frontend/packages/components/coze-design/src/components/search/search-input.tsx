import {
  type ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

import { Input } from '@/components/input';

import { type SearchInputProps, type InputRefType } from './search-types';

/**
 * 搜索场景下的 Input 组件 结合 composition api 优化了中文输入场景
 * @returns Input
 */
export const SearchInput = forwardRef(
  (
    {
      onCompositionStart,
      onSearch,
      onChange,
      onCompositionUpdate,
      onCompositionEnd,
      ...props
    }: SearchInputProps,
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
        data-testid="ui.search-input"
        {...props}
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

SearchInput.displayName = 'SearchInput';
