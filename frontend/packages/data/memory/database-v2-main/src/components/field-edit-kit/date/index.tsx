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

import { type FC, useState, useRef } from 'react';

import { isEmpty, cloneDeep } from 'lodash-es';
import { format } from 'date-fns';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type BaseDatePicker, DatePicker } from '@coze-arch/coze-design';

import {
  type ChangeDataParams,
  type TableRow,
} from '../../database-table-data/type';

import styles from './index.module.less';

interface IProps {
  rowData: TableRow;
  value: string | undefined;
  rowKey: string;
  fieldName: string;
  required: boolean;
  onChange?: (params: ChangeDataParams) => void;
  disabled: boolean;
}

const formatValue = (dValue: string | Date | Date[] | string[] | undefined) => {
  let formattedValue = '';
  if (!dValue) {
    return '';
  }

  try {
    if (dValue instanceof Date) {
      // Single Date Object
      formattedValue = format(dValue, 'yyyy-MM-dd HH:mm:ss');
    } else if (Array.isArray(dValue)) {
      // Date [] or string []
      formattedValue = dValue
        .map(item => {
          if (item instanceof Date) {
            return format(item, 'yyyy-MM-dd HH:mm:ss');
          } else if (typeof item === 'string') {
            // Assume string is in valid date format
            return format(new Date(item), 'yyyy-MM-dd HH:mm:ss');
          }
          return '';
        })
        .join(', '); // Use commas to separate different dates
    } else if (typeof dValue === 'string') {
      // Single string
      formattedValue = format(new Date(dValue), 'yyyy-MM-dd HH:mm:ss');
    }
  } catch {
    formattedValue = '';
  }

  return formattedValue;
};

export const EditKitDatePicker: FC<IProps> = props => {
  const { value, onChange, fieldName, required, rowData, disabled } = props;

  const [clicked, setClicked] = useState(false);
  const [internalValue, setIntervalValue] = useState(formatValue(value));

  const ref = useRef<BaseDatePicker>(null);

  const handlePlaceholderClick = () => {
    if (disabled) {
      return;
    }
    setClicked(true);

    setTimeout(() => {
      ref.current?.focus();
      ref.current?.open();
    }, 50);
  };

  const handleInputBlur = () => {
    setClicked(false);
  };

  const handleChange = (
    newValue: string | Date | Date[] | string[] | undefined,
  ) => {
    const formattedValue = formatValue(newValue);
    setIntervalValue(formattedValue);
    const newRowData = cloneDeep(rowData);
    newRowData[fieldName].value = formattedValue;
    onChange?.({
      newRowData,
    });
  };

  const showRequiredTips = required && isEmpty(internalValue);

  if (disabled) {
    return (
      <div className="w-full h-[32px] cursor-not-allowed rounded-[8px] px-[8px] flex items-center border-[1px] border-solid border-transparent">
        <span
          className={'text-[14px] leading-[20px] truncate coz-fg-secondary'}
        >
          {internalValue}
        </span>
      </div>
    );
  }

  if (!clicked) {
    return (
      <div
        className="w-full h-[32px] rounded-[8px] px-[8px] flex items-center hover:coz-mg-secondary-hovered cursor-pointer border-[1px] border-solid border-transparent"
        onClick={handlePlaceholderClick}
      >
        <span
          className={classNames('text-[14px] leading-[20px] truncate', {
            'coz-fg-secondary': !showRequiredTips,
            'coz-fg-hglt-red': showRequiredTips,
          })}
        >
          {showRequiredTips ? I18n.t('db2_008') : internalValue}
        </span>
      </div>
    );
  }

  return (
    <DatePicker
      type="dateTime"
      value={internalValue}
      onChange={handleChange}
      onBlur={handleInputBlur}
      timePickerOpts={{
        scrollItemProps: { cycled: false },
      }}
      ref={ref}
      showPrefix={false}
      showSuffix={false}
      className={classNames(
        'w-full !coz-bg-max rounded-[8px] hover:!coz-bg-max',
        styles.date,
      )}
      disabled={disabled}
    />
  );
};
