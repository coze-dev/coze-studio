/* eslint-disable @coze-arch/max-line-per-function */
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import { InputNumber as SemiInputNumber } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { IconCozPlusFill, IconCozMinusFill } from '@/components/icon';

import { IconButton, type ButtonProps } from '../button';
import {
  inputNumberButtonVariants,
  inputNumberSuffixContentVariants,
  inputNumberSuffixVariants,
  inputNumberVariants,
} from './input-number-variants';
import { type InputNumberProps } from './input-number-types';

import './input-number.css';
import {
  DEFAULT_STEP,
  DEFAULT_SHIFT_STEP,
  DEFAULT_PRESS_INTERVAL,
} from './const';
import { add, getPrecisionLength } from './utils';

const defaultProps: InputNumberProps = {
  innerButtons: false,
  error: false,
  disabled: false,
  hideButtons: false,
  step: DEFAULT_STEP,
  shiftStep: DEFAULT_SHIFT_STEP,
  pressInterval: DEFAULT_PRESS_INTERVAL,
};

const InputNumberComponent = forwardRef<HTMLInputElement, InputNumberProps>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      className,
      hideButtons,
      innerButtons,
      suffix,
      step = DEFAULT_STEP,
      shiftStep = DEFAULT_SHIFT_STEP,
      max = Number.MAX_SAFE_INTEGER,
      min = Number.MIN_SAFE_INTEGER,
      disabled,
      error,
      onChange,
      onNumberChange,
      onUpClick,
      onDownClick,
      pressInterval,
      onBlur,
      ...restProps
    } = { ...defaultProps, ...props };

    const timer = useRef(0);
    const clearTimer = () => {
      if (timer.current) {
        window.clearInterval(timer.current);
      }
    };

    const [innerValue, setInnerValue] = useState<number | string>(
      defaultValue ?? value ?? '',
    );
    const [isFocus, setIsFocus] = useState<boolean>(false);

    const inputNumberClassName = useMemo(
      () =>
        cn(inputNumberVariants({ error, focus: isFocus && !error }), className),
      [className, error, isFocus],
    );

    useEffect(() => {
      if (value === undefined) {
        return;
      }
      setInnerValue(value);
    }, [value]);

    const getPrecision = (val: number, _step: number) => {
      const minPrecision = getPrecisionLength(min);
      const maxPrecision = getPrecisionLength(max);
      const stepPrecision = getPrecisionLength(_step);
      const numPrecision = getPrecisionLength(val);
      return Math.max(minPrecision, maxPrecision, stepPrecision, numPrecision);
    };

    // 加减
    const handleValueChange = (newVal: number) => {
      setIsFocus(true);
      onChange?.(newVal);
      onNumberChange?.(newVal);
    };
    const handlePlus = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const realStep = e.shiftKey ? shiftStep : step;
      setInnerValue(val => {
        const precision = getPrecision(Number(val), realStep);
        const newVal = add(Number(val), realStep, precision);
        if (newVal > max) {
          clearTimer();
          return val;
        }
        onUpClick?.(`${newVal}`, e);
        handleValueChange(newVal);
        return value === undefined ? newVal : val;
      });
    };
    const handleMinus = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const realStep = e.shiftKey ? shiftStep : step;
      setInnerValue(val => {
        const precision = getPrecision(Number(val), realStep);
        const newVal = add(Number(val), -realStep, precision);
        if (newVal < min) {
          clearTimer();
          return val;
        }
        onDownClick?.(`${newVal}`, e);
        handleValueChange(newVal);
        return value === undefined ? newVal : val;
      });
    };

    const handleChangeEvent = (newVal: string | number) => {
      setInnerValue(newVal);
      onChange?.(newVal);
    };

    const handleNumberChangeEvent = (newVal: number) => {
      setInnerValue(newVal);
      onNumberChange?.(newVal);
    };

    const renderButton = () => {
      if (hideButtons || innerButtons) {
        return null;
      }
      const buttonProps: ButtonProps = {
        className: 'w-24px',
        color: 'secondary',
        size: 'small',
        onMouseLeave: () => {
          setIsFocus(false);
          clearTimer();
        },
        onMouseUp: clearTimer,
      };
      return (
        <div className={inputNumberButtonVariants()}>
          <IconButton
            disabled={disabled || Number(innerValue) <= min}
            onMouseDown={e => {
              handleMinus(e);
              timer.current = window.setInterval(() => {
                handleMinus(e);
              }, pressInterval);
            }}
            icon={<IconCozMinusFill />}
            {...buttonProps}
          />
          <IconButton
            disabled={disabled || Number(innerValue) >= max}
            onMouseDown={e => {
              handlePlus(e);
              timer.current = window.setInterval(() => {
                handlePlus(e);
              }, pressInterval);
            }}
            icon={<IconCozPlusFill />}
            {...buttonProps}
          />
        </div>
      );
    };

    const renderSuffix = () => {
      if (!suffix && hideButtons) {
        return null;
      }
      return (
        <div className={inputNumberSuffixVariants()}>
          {suffix ? (
            <div className={inputNumberSuffixContentVariants()}>{suffix}</div>
          ) : null}
          {renderButton()}
        </div>
      );
    };

    const handleInputBlur = (
      e: React.FocusEvent<HTMLInputElement, Element>,
    ) => {
      if (
        typeof innerValue === 'number' &&
        (innerValue > max || innerValue < min)
      ) {
        const num = innerValue > max ? max : min;
        onNumberChange?.(num);
      }
      onBlur?.(e);
    };

    useEffect(() => clearTimer, []);
    return (
      <SemiInputNumber
        onBlur={handleInputBlur}
        disabled={disabled}
        value={innerValue}
        max={max}
        min={min}
        step={step}
        shiftStep={shiftStep}
        onChange={handleChangeEvent}
        onNumberChange={handleNumberChangeEvent}
        innerButtons={innerButtons}
        hideButtons={true}
        className={inputNumberClassName}
        ref={ref}
        suffix={renderSuffix()}
        {...restProps}
      />
    );
  },
);

InputNumberComponent.displayName = 'InputNumber';
/**
 * @deprecated 不再维护 请使用 CozInputNumber
 */
export const InputNumber = InputNumberComponent;
