import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { useUpdateEffect } from 'ahooks';
import { Input as SemiInput } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { Loading } from '../loading';
import { inputVariants } from './input-variant';
import { type InputProps } from './input-types';

import './index.css';

const defaultProps: Partial<InputProps> = {
  loading: false,
  error: false,
};

// 兼容 builder 使用场景 临时处理
export const InputOld = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      className,
      maxLength,
      onChange,
      prefix,
      suffix,
      loading,
      error,
      disabled,
      onCompositionEnd,
      onCompositionStart,
      onCompositionUpdate,
      getValueLength,
      defaultValue,
      value,
      ...restProps
    } = {
      ...defaultProps,
      ...props,
    };
    const getValueLengthInner = (v: string): number =>
      getValueLength ? getValueLength(v) : v.length;

    const [valueLength, setValueLength] = useState<number>(
      getValueLengthInner(String(value ?? defaultValue ?? '')),
    );
    const [innerValue, setInnerValue] = useState<string>(
      String(value ?? defaultValue ?? ''),
    );

    const compositionFlag = useRef(false);

    const inputClassName = useMemo(
      () =>
        cn(inputVariants({ error, disabled: disabled || loading }), className),
      [className, error],
    );

    useUpdateEffect(() => {
      setInnerValue(String(value ?? ''));
    }, [value]);

    useEffect(() => {
      if (!compositionFlag.current) {
        setValueLength(getValueLengthInner(innerValue));
      }
    }, [innerValue]);

    return (
      <SemiInput
        value={innerValue}
        defaultValue={defaultValue}
        ref={ref}
        onChange={(v, e) => {
          onChange?.(v, e);
          setInnerValue(v);
        }}
        getValueLength={getValueLength}
        className={inputClassName}
        maxLength={maxLength}
        prefix={loading ? <Loading size="mini" loading={loading} /> : prefix}
        suffix={maxLength ? `${valueLength}/${maxLength}` : suffix}
        disabled={disabled || loading}
        onCompositionStart={e => {
          onCompositionStart?.(e);
          compositionFlag.current = true;
        }}
        onCompositionUpdate={e => {
          onCompositionUpdate?.(e);
          compositionFlag.current = true;
        }}
        onCompositionEnd={e => {
          onCompositionEnd?.(e);
          compositionFlag.current = false;
          setValueLength(getValueLengthInner(e.currentTarget.value ?? ''));
        }}
        {...restProps}
      ></SemiInput>
    );
  },
);

InputOld.displayName = 'Input';
