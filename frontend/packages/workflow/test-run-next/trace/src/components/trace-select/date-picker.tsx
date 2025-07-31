/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
