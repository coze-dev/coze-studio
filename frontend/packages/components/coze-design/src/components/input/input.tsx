import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { Input as SemiInput } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { Loading } from '../loading';
import { inputVariants } from './input-variant';
import { type InputProps } from './input-types';

import './index.css';
import { useControllableValue } from '@/hooks';

const defaultProps: Partial<InputProps> = {
  loading: false,
  error: false,
};

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
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
  const [finalValue, setFinalValue] = useControllableValue<React.ReactText>(
    {
      value,
      defaultValue,
      // @ts-expect-error semi定义的类型有问题
      onChange,
    },
    'value' in props,
  );

  const compositionFlag = useRef(false);

  const inputClassName = useMemo(
    () =>
      cn(inputVariants({ error, disabled: disabled || loading }), className),
    [className, error],
  );

  useEffect(() => {
    if (!compositionFlag.current) {
      setValueLength(getValueLengthInner(String(finalValue ?? '')));
    }
  }, [finalValue]);

  return (
    <SemiInput
      value={finalValue}
      defaultValue={defaultValue}
      ref={ref}
      onChange={setFinalValue}
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
});

Input.displayName = 'Input';
