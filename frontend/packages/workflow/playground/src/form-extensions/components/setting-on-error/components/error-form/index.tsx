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
      // If there is an external error, just report the error directly.
      if (errorMsg) {
        return { rs: false, msg: errorMsg };
      }
      // When isOpen = true for the first time, json will be given the default value, and json = undefined for a moment. Just return true, otherwise it will flash.
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
