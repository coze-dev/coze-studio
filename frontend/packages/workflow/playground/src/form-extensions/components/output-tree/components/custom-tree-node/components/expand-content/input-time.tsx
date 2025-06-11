import { DatePicker } from '@coze/coze-design';

import { type DefaultValueInputProps } from './types';

export function InputTime({
  defaultValue,
  className,
  disabled,
  onBlur,
}: DefaultValueInputProps) {
  defaultValue =
    typeof defaultValue === 'string' &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(defaultValue)
      ? defaultValue
      : '';

  return (
    <DatePicker
      className={`${className} rounded-[8px]`}
      inputStyle={{ width: '100%' }}
      type="dateTime"
      size="small"
      defaultValue={defaultValue}
      disabled={disabled}
      format="yyyy-MM-dd HH:mm:ss"
      onChange={(date, dateString) => {
        // onBlur才会触发保存
        if (typeof dateString === 'string' || dateString === undefined) {
          onBlur?.(dateString);
        }
      }}
      onClear={() => {
        onBlur?.('');
      }}
      showClear={true}
    />
  );
}
