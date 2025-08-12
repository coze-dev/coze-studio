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

import React from 'react';

import { SettingOnErrorProcessType } from '@coze-workflow/nodes';

import { Timeout } from '../timeout';
import { RetryTimes } from '../retry-times';
import { ProcessType } from '../process-type';
import { Json } from '../json';
import { Header } from '../header';
import { Ext } from '../ext';
import { type SettingOnErrorValue, type ErrorFormPropsV2 } from '../../types';
import { useExceptionChange } from '../../hooks/use-exception-change';

export const ErrorFormContent: React.FC<ErrorFormPropsV2> = ({
  isOpen = false,
  json,
  onJSONChange,
  readonly,
  errorMsg,
  defaultValue,
  value,
  onChange,
  outputs,
  isBatch,
  syncOutputs,
}) => {
  useExceptionChange({ value });

  const handleChange = (key: keyof SettingOnErrorValue, v) => {
    onChange({
      ...value,
      [key]: v,
    });
  };

  return (
    <div className="pb-40">
      <div className="grid grid-cols-[5fr_5fr_8fr] gap-y-2 gap-x-1">
        <Header />
        <Timeout
          value={value?.timeoutMs}
          onChange={timeoutMs => {
            handleChange('timeoutMs', timeoutMs);
          }}
          readonly={readonly}
        />
        <RetryTimes
          value={value?.retryTimes}
          onChange={retryTimes => {
            const newValue = { ...value };
            onChange({
              ...newValue,
              retryTimes,
            });
          }}
          readonly={readonly}
        />
        <ProcessType
          value={value?.processType}
          onChange={processType => {
            const isBreak =
              !processType || processType === SettingOnErrorProcessType.BREAK;
            const settingOnErrorIsOpen = !isBreak;
            onChange({
              ...value,
              processType,
              settingOnErrorIsOpen,
            });
            syncOutputs?.(settingOnErrorIsOpen);
          }}
          readonly={readonly}
          isBatch={isBatch}
        />
      </div>
      <div className="mt-2">
        <Ext
          value={value?.ext}
          onChange={ext => {
            handleChange('ext', ext);
          }}
          readonly={readonly}
          retryTimes={value?.retryTimes}
        />
      </div>

      <Json
        isOpen={isOpen}
        json={json}
        onJSONChange={onJSONChange}
        readonly={readonly}
        defaultValue={defaultValue}
        processType={value?.processType}
        errorMsg={errorMsg}
        outputs={outputs}
      />
    </div>
  );
};
