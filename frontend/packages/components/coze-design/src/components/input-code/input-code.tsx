import React, { useEffect, useRef, useState } from 'react';

import { range } from 'lodash-es';

import { cn } from '@/utils';

import { Input } from '../input';
import {
  inputCodeDotVariants,
  inputCodeVariants,
  inputVariants,
} from './input-code-variant';
import { DELAY, replaceCharAt } from './input-code-utils';
import { type InputCodeProps } from './input-code-types';

import './index.css';

const defaultProps: Partial<InputCodeProps> = {
  length: 6,
  type: 'password',
  value: '',
};

interface ValueBoxProps {
  value: string;
  type: 'text' | 'password';
  className: string;
}

export const ValueBox: React.FC<ValueBoxProps> = ({
  value,
  type,
  className,
}) => {
  const [visible, setVisible] = useState<boolean>(true);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (type === 'text') {
      return;
    }
    clearTimeout(timerRef.current);
    setVisible(true);
    if (value) {
      setTimeout(() => {
        setVisible(false);
      }, DELAY);
    }
  }, [value]);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );
  return (
    <div className={className}>
      {visible ? value : <div className={inputCodeDotVariants()}></div>}
    </div>
  );
};

export const InputCode: React.FC<InputCodeProps> = props => {
  const {
    dataTheme,
    className,
    length,
    disabled,
    error = false,
    value,
    onChange,
    type,
    onFinish,
    inputProps,
    ...restProps
  } = Object.assign({}, defaultProps, props);

  const classes = cn(inputCodeVariants({ disabled }), className);

  const elementProps = {
    className: classes,
    'data-theme': dataTheme,
  };

  const inputClassName = inputVariants({ error });

  const inputRef = useRef<HTMLInputElement>(null);
  const [innerValue, setInnerValue] = useState<string>(value ?? '');

  useEffect(() => {
    // @ts-expect-error -- linter-disable-autofix
    setInnerValue(value.slice(0, length));
  }, [value]);

  useEffect(() => {
    // @ts-expect-error -- linter-disable-autofix
    if (innerValue.length >= length) {
      onFinish?.(innerValue);
    }
  }, [innerValue, length]);

  const handleInputChange = (index: number, inputValue: string) => {
    const newValue = replaceCharAt(innerValue, inputValue, index).slice(
      0,
      length,
    );
    setInnerValue(newValue);
    onChange?.(newValue);
  };

  const getValueByIndex = (index: number) => innerValue[index] ?? '';

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (disabled) {
      return;
    }
    if (e.key === 'Backspace') {
      if (!getValueByIndex(index)) {
        setInnerValue(innerValue.slice(0, innerValue.length - 1));
      }
    }
  };

  return (
    <div {...elementProps} {...restProps} onClick={handleClick}>
      {range(0, length).map((_, index) =>
        index === innerValue.length ? (
          <Input
            {...inputProps}
            autoFocus
            value={getValueByIndex(index)}
            onChange={inputValue => {
              handleInputChange(index, inputValue);
            }}
            disabled={disabled}
            ref={inputRef}
            key={index}
            onKeyDown={e => {
              handleKeyDown(e, index);
            }}
            className={inputClassName}
          />
        ) : (
          <ValueBox
            className={inputClassName}
            key={index}
            // @ts-expect-error -- linter-disable-autofix
            type={type}
            value={getValueByIndex(index)}
          />
        ),
      )}
    </div>
  );
};

InputCode.displayName = 'InputCode';
