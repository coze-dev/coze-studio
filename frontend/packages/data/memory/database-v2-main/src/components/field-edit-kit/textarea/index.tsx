import React, { useState, type FC, useRef } from 'react';

import { isUndefined, cloneDeep } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { TextArea } from '@coze/coze-design';

import {
  type ChangeDataParams,
  type TableRow,
} from '../../database-table-data/type';

interface IProps {
  rowData: TableRow;
  value: string | undefined;
  rowKey: string;
  fieldName: string;
  required: boolean;
  disabled: boolean;
  onChange?: (params: ChangeDataParams) => void;
}

export const EditKitTextarea: FC<IProps> = props => {
  const { value, fieldName, onChange, required, rowData, disabled } = props;

  const [clicked, setClicked] = useState(false);

  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
  };

  const ref = useRef<HTMLTextAreaElement>(null);

  const handlePlaceholderClick = () => {
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
            'coz-fg-dim': showRequiredTips,
          })}
        >
          {showRequiredTips ? I18n.t('db2_008') : internalValue}
        </span>
      </div>
    );
  }

  return (
    <TextArea
      disabled={disabled}
      value={internalValue}
      onChange={handleChange}
      ref={ref}
      onBlur={handleInputBlur}
      className={classNames('w-full !coz-bg-max')}
      rows={1}
      autosize={{
        minRows: 1,
        maxRows: 5,
      }}
    />
  );
};
