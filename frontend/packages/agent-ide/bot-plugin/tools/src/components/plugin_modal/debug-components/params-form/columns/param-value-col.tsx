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

import React, { type FC, useEffect, useState } from 'react';

import { Typography, UIInput } from '@coze-arch/bot-semi';
import {
  type APIParameter,
  ParameterType,
} from '@coze-arch/bot-api/plugin_develop';

import { updateNodeById } from '../../../utils';
import { type APIParameterRecord } from '../../../types/params';
import { ARRAYTAG, ROOTTAG, ROWKEY } from '../../../config';
import { ItemErrorTip } from '../../../components/item-error-tip';
import { FileUploadItem } from '../../../components/file-upload-item';
import { getColumnClass } from './utils';

interface InputItemProps {
  val?: string;
  width?: number | string;
  height?: number;
  check?: number;
  callback: (val: string) => void;
  useCheck?: boolean;
  useBlockWrap?: boolean;
  disabled: boolean;
  desc: string;
}

const InputItem = ({
  val = '',
  callback,
  check = 0,
  width = '100%',
  useCheck = false,
  useBlockWrap = false,
  disabled,
  desc,
}: InputItemProps): JSX.Element => {
  const [value, setValue] = useState(val);
  const [errorStatus, setErrorStatus] = useState(false);
  // Trigger validation via check (when committed)
  useEffect(() => {
    if (check === 0 || value === ARRAYTAG || value === ROOTTAG) {
      return;
    }
    handleCheck(value);
  }, [check]);
  const handleCheck = (v: string) => {
    if (!useCheck) {
      return;
    }

    const filterVal = v ? String(v).replace(/\s+/g, '') : '';
    setErrorStatus(filterVal === '');
  };

  return (
    <span
      style={{ width, ...(useBlockWrap ? { display: 'inline-block' } : {}) }}
    >
      <UIInput
        disabled={disabled}
        value={value}
        validateStatus={errorStatus ? 'error' : 'default'}
        onChange={(e: string) => {
          setValue(e);
          callback(e);
          handleCheck(e);
        }}
      />
      <br />
      {errorStatus ? <ItemErrorTip withDescription={!!desc} /> : null}
    </span>
  );
};

export const ValueColRender: FC<{
  record: APIParameterRecord;
  disabled?: boolean;
  check: number;
  needCheck: boolean;
  defaultKey: string;
  data: Array<APIParameter>;
  supportFileTypeUpload: boolean;
}> = ({
  record,
  data,
  disabled = false,
  check,
  needCheck,
  defaultKey,
  supportFileTypeUpload = false,
}) => {
  const showInput = !(
    record?.type === ParameterType.Object ||
    record?.type === ParameterType.Array ||
    (disabled && record.value === undefined)
  );

  const showFile =
    record?.type === ParameterType.String && !!record?.assist_type;

  let renderItem = <></>;

  if (supportFileTypeUpload && showFile) {
    renderItem = (
      <FileUploadItem
        // @ts-expect-error -- linter-disable-autofix
        defaultValue={record.value || record?.[defaultKey]}
        // @ts-expect-error -- linter-disable-autofix
        assistParameterType={record.assist_type}
        onChange={uri => {
          updateNodeById({
            data,
            targetKey: record[ROWKEY] as string,
            field: 'value',
            value: uri ? uri : null,
          });
        }}
        withDescription={!!record?.desc}
        required={needCheck || record?.is_required}
        check={check}
        disabled={disabled}
      />
    );
  } else if (showInput) {
    renderItem = (
      <div className={getColumnClass(record)}>
        <InputItem
          disabled={disabled}
          useBlockWrap={true}
          // @ts-expect-error -- linter-disable-autofix
          val={record.value || record?.[defaultKey]}
          check={check}
          useCheck={needCheck || record?.is_required}
          callback={(e: string) => {
            updateNodeById({
              data,
              targetKey: record[ROWKEY] as string,
              field: 'value',
              value: e,
            });
            updateNodeById({
              data,
              targetKey: record[ROWKEY] as string,
              field: defaultKey,
              value: e,
            });
          }}
          // @ts-expect-error -- linter-disable-autofix
          desc={record.desc}
        />
      </div>
    );
  }

  return (
    <div className="mr-[3px]">
      {renderItem}
      {record.desc ? (
        <Typography.Text
          size="small"
          ellipsis={{
            showTooltip: {
              opts: { content: record.desc },
            },
          }}
          style={{ verticalAlign: showInput ? 'top' : 'middle' }}
        >
          {record.desc}
        </Typography.Text>
      ) : null}
    </div>
  );
};
