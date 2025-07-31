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

import React, { useState, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircleFill } from '@coze-arch/coze-design/icons';
import { Input, Tooltip } from '@coze-arch/coze-design';

import { ErrorCode } from '../constants';

import s from './index.module.less';

export const EditInput = ({
  ref,
  defaultValue,
  loading,
  onBlur,
  onValidate,
}: {
  ref?: React.Ref<HTMLInputElement>;
  /**
   * default value
   */
  defaultValue?: string;
  /**
   * loading
   */
  loading: boolean;
  /**
   * Behavior performed after out of focus/enter
   */
  onBlur?: (input?: string, error?: ErrorCode) => void;
  /**
   * Verification function, returns true to indicate that the verification passed
   */
  onValidate?: (input: string) => ErrorCode | undefined;
}) => {
  const [input, setInput] = useState(defaultValue);
  const [error, setError] = useState<ErrorCode | undefined>(undefined);

  const handleCreateSession = () => {
    onBlur?.(input, error);
    setInput('');
  };

  const handleValidateName = (_input: string) => {
    setInput(_input);
    const validateRes = onValidate?.(_input);
    if (validateRes) {
      setError(validateRes);
    } else {
      setError(undefined);
    }
  };

  const renderError = useMemo(() => {
    if (error === ErrorCode.DUPLICATE) {
      return I18n.t('wf_chatflow_109');
    } else if (error === ErrorCode.EXCEED_MAX_LENGTH) {
      return I18n.t('wf_chatflow_116');
    }
  }, [error]);
  return (
    <Input
      ref={ref}
      className={s.input}
      size="small"
      loading={loading}
      autoFocus
      onChange={handleValidateName}
      placeholder={'Please enter'}
      defaultValue={defaultValue}
      error={Boolean(error)}
      suffix={
        error ? (
          <Tooltip content={renderError} position="right">
            <IconCozWarningCircleFill className="coz-fg-hglt-red absolute right-1 text-[13px]" />
          </Tooltip>
        ) : null
      }
      onBlur={handleCreateSession}
      onEnterPress={handleCreateSession}
    />
  );
};
