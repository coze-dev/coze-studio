import { useEffect, useRef, forwardRef, type JSX, type FC } from 'react';

import { InputNumber as SemiInputNumber } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';
import { useDragNumberControl } from '@/hooks/use-drag-number-control';
import { useControllableValue } from '@/hooks/use-controllable-value';

import { inputNumberVariants } from './input-number-variants';
import { type InputNumberProps } from './input-number-types';

import './input-number.css';

// TODO: 抽象代码，and UT

const defaultProps: Partial<InputNumberProps> = {
  size: 'default',
  error: false,
};

export const CozInputNumber: FC<InputNumberProps> = forwardRef<
  HTMLInputElement,
  InputNumberProps
>((props, ref): JSX.Element => {
  const {
    dataTheme,
    className,
    value,
    defaultValue,
    onChange,
    hideButtons = false,
    error,
    sliderControl = false,
    prefix,
    suffix,
    step = 1,
    min,
    max,
    innerButtons = true,
    ...restProps
  } = mergeProps(props, defaultProps);

  const [finalValue, setFinalValue] = useControllableValue({
    value,
    defaultValue,
    onChange,
  });

  const { isDragging, handleDragStart } = useDragNumberControl({
    value: finalValue as number,
    onChange: setFinalValue,
    step,
    min,
    max,
  });

  const cls = cn(
    inputNumberVariants({ error }),
    'coz-input-number-new',
    hideButtons && 'coz-input-number-new-hide-buttons',
    isDragging && 'coz-input-number-new-dragging',
    className,
    suffix &&
      innerButtons === false &&
      'coz-input-number-suffix-with-inner-buttons',
  );

  const inputNumberRef = useRef<HTMLInputElement>(null);

  // 使用 useEffect 来同步 refs
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(inputNumberRef.current);
    } else if (ref) {
      ref.current = inputNumberRef.current;
    }
  }, [ref]);

  return (
    <SemiInputNumber
      prefix={
        sliderControl && prefix ? (
          <div
            className="ew-resize-cursor semi-input-prefix semi-input-prefix-text"
            onMouseDown={e => handleDragStart(e, inputNumberRef)}
          >
            {prefix}
          </div>
        ) : (
          prefix
        )
      }
      suffix={
        sliderControl && suffix ? (
          <div
            className="ew-resize-cursor semi-input-suffix semi-input-suffix-text"
            onMouseDown={e => handleDragStart(e, inputNumberRef)}
          >
            {suffix}
          </div>
        ) : (
          suffix
        )
      }
      hideButtons={hideButtons}
      innerButtons={hideButtons ? false : innerButtons}
      ref={inputNumberRef}
      data-theme={dataTheme}
      className={cls}
      value={finalValue}
      onChange={setFinalValue}
      step={step}
      min={min}
      max={max}
      {...restProps}
    />
  );
});

CozInputNumber.displayName = 'CozInputNumber';
