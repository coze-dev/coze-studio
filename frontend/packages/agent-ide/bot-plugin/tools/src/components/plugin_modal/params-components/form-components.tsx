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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useState } from 'react';

import cl from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { UIInput, UISelect, Typography, Tooltip } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import { ParameterType } from '@coze-arch/bot-api/plugin_develop';
import { IconAlertCircle } from '@douyinfe/semi-icons';

import { checkSameName } from '../utils';
import { type InputItemProps } from '../types';
import s from '../index.module.less';
import {
  ARRAYTAG,
  ParamsFormErrorStatus,
  paramsFormErrorStatusText,
  ROOTTAG,
} from '../config';

const DEEP_INDENT_NUM = 20;

export const InputItem = ({
  val = '',
  max = 500,
  check = 0,
  width = 200,
  useCheck = true,
  filterSpace = true,
  placeholder,
  callback,
  targetKey = '',
  checkSame = false,
  checkAscii = false,
  isRequired = false,
  data,
  useBlockWrap = false,
  disabled,
  dynamicWidth = false,
  deep = 1,
}: InputItemProps): JSX.Element => {
  const [value, setValue] = useState(val);
  const [errorStatus, setErrorStatus] = useState<number>(0);
  useEffect(() => {
    setValue(val);
  }, [val]);
  // Trigger validation via check (when committed)
  useEffect(() => {
    if (check === 0 || value === ARRAYTAG || value === ROOTTAG) {
      return;
    }
    handleCheck(value);
  }, [check]);
  // validation
  const handleCheck = (checkVal: string) => {
    let status =
      checkVal === ''
        ? ParamsFormErrorStatus.NAME_EMPTY
        : ParamsFormErrorStatus.NO_ERROR;
    if (isRequired && checkVal === '') {
      setErrorStatus(ParamsFormErrorStatus.DESC_EMPTY);
      return;
    }
    if (checkAscii) {
      if (!IS_OVERSEA) {
        setErrorStatus(ParamsFormErrorStatus.NO_ERROR);
        return;
      }
      // eslint-disable-next-line no-control-regex
      status = /^[\x00-\x7F]+$/.test(checkVal)
        ? ParamsFormErrorStatus.NO_ERROR
        : ParamsFormErrorStatus.ASCII;
      status = checkVal === '' ? ParamsFormErrorStatus.NO_ERROR : status;
      setErrorStatus(status);
    }
    if (!useCheck) {
      return;
    }
    if (!status) {
      status = !/^[\w-]+$/.test(checkVal)
        ? ParamsFormErrorStatus.CHINESE
        : ParamsFormErrorStatus.NO_ERROR;
    }
    if (!status && data && checkSame) {
      status = checkSameName(data, targetKey, checkVal)
        ? ParamsFormErrorStatus.REPEAT
        : ParamsFormErrorStatus.NO_ERROR;
    }
    setErrorStatus(status);
  };
  // Filter spaces, limit input length
  const handleFilter = (v: string) => {
    if (filterSpace) {
      v = v.replace(/\s+/g, '');
    }
    if (max > 0) {
      v = v.slice(0, max);
    }
    return v;
  };
  const hasSub =
    deep === 1
      ? data?.some(
          item =>
            item.type === ParameterType.Array ||
            item.type === ParameterType.Object,
        )
      : true;
  // Each additional layer decreases the width by 20 because of the expansion icon.
  const vWidth = dynamicWidth
    ? `calc(100% - ${DEEP_INDENT_NUM * deep}px)`
    : width;
  const tipWidth = dynamicWidth
    ? `calc(100% - ${DEEP_INDENT_NUM * deep}px - 8px)`
    : width;

  const errorStatusMsg = () => (
    <>
      {dynamicWidth && !hasSub ? (
        <span style={{ display: 'inline-block', width: 22 }}></span>
      ) : null}
      <Typography.Text
        component="span"
        ellipsis={{
          showTooltip: {
            type: 'tooltip',
            opts: { style: { maxWidth: '100%' } },
          },
        }}
        className={s['plugin-tooltip-error']}
      >
        {/* @ts-expect-error -- linter-disable-autofix */}
        <span>{paramsFormErrorStatusText[errorStatus]}</span>
      </Typography.Text>
    </>
  );

  return (
    <span
      style={useBlockWrap ? { display: 'inline-block', width: '100%' } : {}}
    >
      {dynamicWidth && !hasSub ? (
        <span style={{ display: 'inline-block', width: 20 }}></span>
      ) : null}
      <UIInput
        placeholder={placeholder}
        disabled={disabled || value === ARRAYTAG || value === ROOTTAG}
        style={{ width: vWidth }}
        value={value}
        validateStatus={errorStatus ? 'error' : 'default'}
        onChange={(e: string) => {
          const newVal = handleFilter(e);
          callback?.(newVal);
          setValue(newVal);
          handleCheck(newVal);
        }}
        onBlur={() => {
          handleCheck(value);
        }}
      />
      <br />
      {/* Parameter name Set dynamic column width */}
      {errorStatus !== 0 && dynamicWidth ? (
        <div className={s['check-box']} style={{ width: tipWidth }}>
          <span className={cl(s['form-check-tip'], 'errorClassTag', s.w110)}>
            {errorStatusMsg()}
          </span>
        </div>
      ) : null}
      {/* Non-parametric list setting fixed maximum width */}
      {errorStatus !== 0 && !dynamicWidth && (
        <div className={s['check-box']} style={{ width: tipWidth }}>
          <span
            style={{
              marginLeft: 4,
              right: -15,
            }}
            className={cl(s['form-check-tip'], 'errorClassTag')}
          >
            {errorStatusMsg()}
          </span>
        </div>
      )}
    </span>
  );
};

export const SelectItem = ({
  check = 0,
  useBlockWrap = false,
  record,
  disabled,
  typeOptions,
  selectCallback,
}: InputItemProps): JSX.Element => {
  const [value, setValue] = useState(!record?.type ? undefined : record?.type);
  const [errorStatus, setErrorStatus] = useState<number>(0);

  // Trigger validation via check (when committed)
  useEffect(() => {
    if (check === 0) {
      return;
    }
    handleCheck(value);
  }, [check]);
  // validation
  const handleCheck = (val: string | ParameterType | undefined) => {
    const status = val === undefined ? 1 : 0;
    setErrorStatus(status);
  };

  return (
    <span
      style={useBlockWrap ? { display: 'inline-block', width: '100%' } : {}}
    >
      <UISelect
        theme="light"
        validateStatus={errorStatus ? 'error' : 'default'}
        value={value}
        disabled={disabled}
        onChange={e => {
          selectCallback?.(e);
          setValue(e as ParameterType);
          handleCheck(e as ParameterType);
        }}
        style={{ width: '100%' }}
      >
        {typeOptions?.map(item => (
          <UISelect.Option
            key={(record?.id || '') + item.label}
            value={item.value}
          >
            {item.label}
          </UISelect.Option>
        ))}
      </UISelect>
      <br />
      {errorStatus !== 0 && (
        <div style={{ position: 'relative' }}>
          <span className={cl(s['form-check-tip'], 'errorClassTag', s.w110)}>
            <IconAlertCircle className={s['plugin-icon-error']} />
            <Typography.Text
              component="span"
              ellipsis={{
                showTooltip: {
                  type: 'tooltip',
                  opts: { style: { maxWidth: '100%' } },
                },
              }}
              className={s['plugin-tooltip-error']}
            >
              {errorStatus === 1 && (
                <span>{I18n.t('plugin_Parameter_type')}</span>
              )}
            </Typography.Text>
          </span>
        </div>
      )}
    </span>
  );
};

interface FormTitle {
  name: string;
  required?: boolean;
  toolTipText?: string;
}

export const FormTitle = (titleInfo: FormTitle) => (
  <div className="whitespace-nowrap">
    {titleInfo.name}
    {titleInfo.required ? (
      <Typography.Text style={{ color: 'red', marginLeft: -3 }}>
        {' * '}
      </Typography.Text>
    ) : null}
    {titleInfo.toolTipText ? (
      <Tooltip content={titleInfo.toolTipText}>
        <IconInfo
          style={{
            color: '#5f5f5f9e',
            position: 'relative',
            top: 3,
            left: 2,
          }}
        />
      </Tooltip>
    ) : null}
  </div>
);
