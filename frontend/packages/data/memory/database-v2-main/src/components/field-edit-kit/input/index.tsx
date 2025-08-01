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

import React, { useState, type FC, useRef } from 'react';

import { cloneDeep, isUndefined } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Input, InputNumber } from '@coze-arch/coze-design';

import {
  type ChangeDataParams,
  type TableRow,
} from '../../database-table-data/type';

import styles from './index.module.less';

interface IProps {
  rowData: TableRow;
  value: React.ReactText | undefined;
  type: 'string' | 'float' | 'integer';
  rowKey: string;
  fieldName: string;
  required: boolean;
  onChange?: (params: ChangeDataParams) => void;
  disabled?: boolean;
}

export const EditKitInput: FC<IProps> = props => {
  const {
    value,
    type,
    fieldName,
    onChange,
    required,
    rowData,
    disabled = false,
  } = props;

  const [clicked, setClicked] = useState(false);

  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (newValue: React.ReactText) => {
    setInternalValue(newValue);
  };

  const ref = useRef<HTMLInputElement>(null);

  const handlePlaceholderClick = () => {
    if (disabled) {
      return;
    }
    setClicked(true);

    setTimeout(() => {
      ref.current?.focus();
    }, 50);
  };

  const handleInputBlur = () => {
    const newRowData = cloneDeep(rowData);
    newRowData[fieldName].value = internalValue || '';
    onChange?.({
      newRowData,
    });
    setClicked(false);
  };

  const showRequiredTips =
    required && (isUndefined(internalValue) || internalValue === '');

  if (disabled) {
    return (
      <div className="w-full h-[32px] rounded-[8px] cursor-not-allowed px-[8px] flex items-center border-[1px] border-solid border-transparent">
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
        className={`w-full h-[32px] rounded-[8px] px-[8px] flex items-center border-[1px] border-solid border-transparent ${
          disabled
            ? 'cursor-not-allowed'
            : 'hover:coz-mg-secondary-hovered cursor-pointer'
        }`}
        onClick={handlePlaceholderClick}
      >
        <span
          className={classNames('text-[14px] leading-[20px] truncate', {
            'coz-fg-secondary': !showRequiredTips,
            'coz-fg-dim': showRequiredTips,
          })}
        >
          {showRequiredTips ? I18n.t('db2_008') : internalValue}
        </span>
      </div>
    );
  }

  if (type === 'float') {
    return (
      <InputNumber
        value={internalValue}
        onChange={handleChange}
        ref={ref}
        onBlur={handleInputBlur}
        keepFocus={true}
        max={Number.MAX_SAFE_INTEGER}
        min={Number.MIN_SAFE_INTEGER}
        hideButtons={true}
        className={classNames('w-full', styles.input)}
        disabled={disabled}
      />
    );
  }

  if (type === 'integer') {
    return (
      <InputNumber
        value={internalValue}
        onChange={handleChange}
        precision={0}
        ref={ref}
        onBlur={handleInputBlur}
        keepFocus={true}
        max={Number.MAX_SAFE_INTEGER}
        min={Number.MIN_SAFE_INTEGER}
        hideButtons={true}
        className={classNames('w-full', styles.input)}
        disabled={disabled}
      />
    );
  }

  return (
    <Input
      value={internalValue}
      onChange={handleChange}
      ref={ref}
      onBlur={handleInputBlur}
      className={classNames('w-full', styles.input)}
      disabled={disabled}
    />
  );
};
