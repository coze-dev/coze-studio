import { useCallback } from 'react';

import dayjs from 'dayjs';
import { IconCozCalendar } from '@coze-arch/coze-design/icons';
import {
  DatePicker as DatePickerCore,
  type DatePickerProps as DatePickerCoreProps,
  IconButton,
} from '@coze-arch/coze-design';

type DatePickerProps = Pick<DatePickerCoreProps, 'value'> & {
  onChange: (v: [Date, Date]) => void;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  onChange,
  ...props
}) => {
  const disabledDate = (date?: Date) => {
    if (!date) {
      return false;
    }
    const current = date.getTime();
    const end = dayjs().endOf('day').valueOf();
    const start = dayjs().subtract(6, 'day').startOf('day').valueOf();

    return current < start || current > end;
  };

  const triggerRender = useCallback(
    () => (
      <IconButton icon={<IconCozCalendar />} color="secondary" size="small" />
    ),
    [],
  );
  const handleChange = (v: any) => {
    onChange(v);
  };

  return (
    <DatePickerCore
      type="dateRange"
      triggerRender={triggerRender}
      disabledDate={disabledDate}
      onChange={handleChange}
      {...props}
    />
  );
};
