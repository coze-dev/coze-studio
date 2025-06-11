import { type FC, useRef } from 'react';

import classNames from 'classnames';
import { DatePicker } from '@coze/coze-design';

import { type LiteralValueInputProps } from './type';

import styles from './styles.module.less';

export const InputTime: FC<LiteralValueInputProps> = ({
  value,
  defaultValue,
  disabled,
  testId,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  validateStatus,
  style,
  className,
}) => {
  defaultValue =
    typeof defaultValue === 'string' &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(defaultValue)
      ? defaultValue
      : '';

  const val = defaultValue ?? value;
  const valueRef = useRef(val as string | undefined | null);

  const handleChange = (newVal?: string) => {
    onChange?.(newVal);
    valueRef.current = newVal;
  };

  return (
    <DatePicker
      className={classNames(className, styles['input-time'])}
      data-testid={testId}
      inputStyle={{ width: '100%' }}
      type="dateTime"
      size="small"
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value as string}
      disabled={disabled}
      format="yyyy-MM-dd HH:mm:ss"
      validateStatus={validateStatus}
      onFocus={onFocus}
      onChange={(date, dateString) => {
        if (typeof dateString === 'string' || dateString === undefined) {
          handleChange(dateString);
        }
      }}
      onClear={() => {
        handleChange('');
        onBlur?.('');
      }}
      onBlur={() => {
        onBlur?.(valueRef.current);
      }}
      showClear={true}
      style={style}
    />
  );
};
