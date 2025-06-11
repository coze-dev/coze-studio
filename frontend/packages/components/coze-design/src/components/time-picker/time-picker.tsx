import { forwardRef, useMemo } from 'react';

import { Input, TimePicker as SemiTimePicker } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { IconCozClock, IconCozArrowDown } from '@/components/icon';

import {
  timePickerInputIconVariants,
  timePickerInputVariants,
  timePickerVariants,
} from './time-picker-variant';
import { type TimePickerProps } from './time-picker-types';

import './index.css';

const defaultProps: Partial<TimePickerProps> = {
  showIcon: true,
  showUnit: true,
  size: 'default',
  disabled: false,
};

export const TimePicker = forwardRef<SemiTimePicker, TimePickerProps>(
  (props, ref): JSX.Element => {
    const {
      showUnit,
      showIcon,
      className,
      popupClassName,
      scrollItemProps,
      triggerRender,
      disabled,
      size,
      ...restProps
    } = {
      ...defaultProps,
      ...props,
    };

    const _scrollItemProps = {
      ...scrollItemProps,
    };

    if (showUnit === false && !_scrollItemProps?.transform) {
      _scrollItemProps.transform = value => value;
    }

    const timePickerClassName = useMemo(
      () => cn(className, timePickerVariants({ size })),
      [className, size],
    );

    const timePickerInputClassName = useMemo(
      () => timePickerInputVariants({ disabled, size }),
      [disabled, size],
    );

    const timePickerInputIconClassName = useMemo(
      () => timePickerInputIconVariants({ disabled, size }),
      [disabled, size],
    );

    const renderInput = params => {
      const { placeholder, inputValue } = params;
      return (
        <Input
          size={size}
          disabled={disabled}
          className={timePickerInputClassName}
          onFocus={e => {
            e.target.blur();
          }}
          readOnly
          value={inputValue}
          placeholder={disabled ? '' : placeholder}
          prefix={
            showIcon ? (
              <IconCozClock className={timePickerInputIconClassName} />
            ) : null
          }
          suffix={<IconCozArrowDown className={timePickerInputIconClassName} />}
        ></Input>
      );
    };

    return (
      <SemiTimePicker
        {...restProps}
        disabled={disabled}
        className={timePickerClassName}
        scrollItemProps={_scrollItemProps}
        triggerRender={
          typeof triggerRender === 'function' ? triggerRender : renderInput
        }
        popupClassName={cn('coz-time-picker-popup', popupClassName)}
        ref={ref}
      ></SemiTimePicker>
    );
  },
);

TimePicker.displayName = 'TimePicker';
