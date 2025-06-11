/* eslint-disable @coze-arch/max-line-per-function */
import { forwardRef, useEffect, useMemo, useState } from 'react';

import {
  type BaseDatePicker,
  type DatePickerProps as SemiDatePickerProps,
} from '@douyinfe/semi-ui/lib/es/datePicker';
import { DatePicker as SemiDatePicker } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import {
  IconCozArrowDown,
  IconCozCalendar,
  IconCozCross,
} from '@/components/icon';

import { Select } from '../select';
import { IconButton } from '../button';
import { formatValue } from './utils';
import {
  datePickerDayContentVariants,
  datePickerDayVariants,
  datePickerInputIconVariants,
} from './date-picker-variant';
import {
  type DatePickerType,
  type DatePickerProps,
  type DayStatusType,
} from './date-picker-type';

import './index.css';

const defaultProps: Partial<DatePickerProps> = {
  showPrefix: true,
  showSuffix: true,
  size: 'default',
  type: 'date',
  rangeSeparator: '～',
};

const getDefaultFormatToken = (type: DatePickerType) => {
  if (type === 'month' || type === 'monthRange') {
    return 'yyyy-MM';
  } else if (type === 'dateTime' || type === 'dateTimeRange') {
    return 'yyyy-MM-dd HH:mm:ss';
  }
  return 'yyyy-MM-dd';
};

export const DatePicker = forwardRef<BaseDatePicker, DatePickerProps>(
  (props, ref): JSX.Element => {
    const {
      showClear,
      onClear,
      value,
      defaultValue,
      dropdownClassName,
      showPrefix,
      showSuffix,
      size,
      type = 'date',
      disabled,
      format,
      rangeSeparator,
      autoFocus,
      inputStyle,
      multiple,
      triggerRender,
      onChange,
      renderDate,
      ...restProps
    } = { ...defaultProps, ...props };
    const formatToken = format ?? getDefaultFormatToken(type);
    const [innerValue, setInnerValue] = useState<string | string[]>(
      formatValue(defaultValue ?? value ?? '', formatToken),
    );

    const isControlled = value !== undefined;

    const iconClassName = useMemo(
      () => datePickerInputIconVariants({ size }),
      [size],
    );

    const renderFullDate = (
      dayNumber?: number,
      fullDate?: string,
      dayStatus?: DayStatusType,
    ) => {
      const {
        isToday,
        isDisabled,
        isInRange = false,
        isHover = false,
        isSelected,
        isSelectedStart = false,
        isSelectedEnd = false,
        isHoverDayInStartSelection = false,
      } = dayStatus || {};

      const wrapperCls = datePickerDayVariants({
        isInRange,
        isDisabled,
        isHover: isHover && !isHoverDayInStartSelection,
      });
      const contentCls = datePickerDayContentVariants({
        isToday,
        isInRange,
        isDisabled,
        isHover: isHover && !isHoverDayInStartSelection,
        isSelected: isSelected || isSelectedStart || isSelectedEnd,
      });
      return (
        <div className={wrapperCls}>
          <div className={contentCls}>
            {renderDate ? renderDate(dayNumber, fullDate) : dayNumber}
          </div>
        </div>
      );
    };

    const formatTriggerValue = () => {
      if (!innerValue || !innerValue.length) {
        return '';
      }

      const start = innerValue[0];
      const end = innerValue[1];

      switch (type) {
        case 'dateRange':
        case 'monthRange':
        case 'dateTimeRange':
          return `${start} ${rangeSeparator} ${end}`;
        case 'date':
        case 'dateTime':
        case 'month':
        default:
          return innerValue;
      }
    };

    const renderSelect = (params: SemiDatePickerProps) => {
      const { placeholder } = params;
      return (
        <Select
          showArrow={false}
          showClear={false}
          validateStatus={restProps?.validateStatus}
          suffix={
            showSuffix ? (
              <div className="flex items-center">
                {showClear && innerValue ? (
                  <IconButton
                    data-testid="coz-date-picker-clear-icon"
                    wrapperClass="flex"
                    onClick={e => {
                      e.stopPropagation();
                      if (!isControlled) {
                        setInnerValue('');
                      }
                      props.onClear?.();
                    }}
                    color="secondary"
                    size="mini"
                    icon={<IconCozCross />}
                  />
                ) : null}
                {
                  <IconCozArrowDown className="text-base coz-fg-secondary ml-4px mr-8px" />
                }
              </div>
            ) : null
          }
          onChange={val => {
            setInnerValue((val as string | string[]) ?? '');
          }}
          multiple={multiple}
          autoFocus={autoFocus}
          size={size}
          disabled={disabled}
          prefix={
            showPrefix ? (
              <IconCozCalendar
                data-testid="coz-date-picker-prefix-icon"
                className={iconClassName}
              />
            ) : null
          }
          style={inputStyle}
          className="coz-date-picker-select"
          emptyContent={null}
          value={formatTriggerValue()}
          placeholder={placeholder}
        ></Select>
      );
    };

    const showTopSlot = type === 'dateRange' || type === 'dateTimeRange';

    // 受控模式
    useEffect(() => {
      if (!isControlled) {
        return;
      }
      setInnerValue(formatValue(value, formatToken));
    }, [value]);

    return (
      <SemiDatePicker
        {...restProps}
        value={innerValue}
        onChange={(val, valStr) => {
          if (!isControlled) {
            setInnerValue((valStr as string | string[]) ?? '');
          }
          onChange?.(val, valStr);
        }}
        rangeSeparator={rangeSeparator}
        format={format}
        multiple={multiple}
        type={type}
        disabled={disabled}
        topSlot={
          showTopSlot ? (
            <div className="flex">
              <div className="flex-1 px-3 text-foreground-2">Start</div>
              <div className="flex-1 px-3 text-foreground-2">End</div>
            </div>
          ) : null
        }
        triggerRender={
          typeof triggerRender === 'function' ? triggerRender : renderSelect
        }
        dropdownClassName={cn('coz-date-picker', dropdownClassName)}
        density="compact"
        renderFullDate={
          props.renderFullDate ? props.renderFullDate : renderFullDate
        }
        ref={ref}
      ></SemiDatePicker>
    );
  },
);

DatePicker.displayName = 'DatePicker';
