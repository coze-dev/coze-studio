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
 
import React, { useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';

import { type ErrorFormPropsV2 } from '../../types';
import { ErrorFormCard } from './card';

export const ErrorForm: React.FC<ErrorFormPropsV2> = ({
  isOpen = false,
  json,
  onSwitchChange,
  onJSONChange,
  readonly,
  errorMsg,
  defaultValue,
  noPadding,
  ...props
}) => {
  const hasError = useMemo(() => {
    if (!isOpen) {
      return { rs: true };
    } else {
      // 如果有外部传进来的 error 直接报错就好
      if (errorMsg) {
        return { rs: false, msg: errorMsg };
      }
      // 初次 isOpen = true 时，会给 json 默认值，有一瞬间的 json = undefined。返回 true 就好，否则会闪一下
      if (json === undefined) {
        return { rs: true };
      }
      try {
        const obj = JSON.parse(json);
        if (typeof obj !== 'object') {
          return {
            rs: false,
            msg: I18n.t('workflow_exception_ignore_json_error'),
          };
        }
        return { rs: true };
        // eslint-disable-next-line @coze-arch/use-error-in-catch
      } catch (e) {
        return {
          rs: false,
          msg: I18n.t('workflow_exception_ignore_json_error'),
        };
      }
    }
  }, [isOpen, json, errorMsg]);

  return (
    <ErrorFormCard
      isOpen={isOpen}
      json={json}
      onSwitchChange={onSwitchChange}
      onJSONChange={onJSONChange}
      readonly={readonly}
      errorMsg={hasError.msg}
      defaultValue={defaultValue}
      noPadding={noPadding}
      {...props}
    />
  );
};
