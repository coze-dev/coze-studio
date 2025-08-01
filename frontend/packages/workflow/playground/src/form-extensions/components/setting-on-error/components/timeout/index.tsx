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

/* eslint-disable @typescript-eslint/no-magic-numbers */
import { useEffect, useState, type FC } from 'react';

import { useTimeoutConfig } from '@coze-workflow/nodes';
import { logger } from '@coze-arch/logger';
import { Input } from '@coze-arch/coze-design';

import { type SettingOnErrorItemProps } from '../../types';

// Millisecond to second (intelligently removes ending zeros)
const msToSeconds = (ms: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });
  return formatter.format(ms / 1000);
};

/**
 * timeout
 */
export const Timeout: FC<SettingOnErrorItemProps<number>> = ({
  value,
  onChange,
  readonly,
}) => {
  const timeoutConfig = useTimeoutConfig();
  const [inputValue, setInputValue] = useState('');

  // Back-end millisecond to front-end second display
  useEffect(() => {
    const seconds = msToSeconds(value ?? timeoutConfig.default);
    setInputValue(seconds);
  }, [timeoutConfig.default, value]);

  // Handling input changes
  const handleChange = (v: string | number) => {
    const rawValue = String(v);
    // Limit input format: allow numbers and decimal points, up to three decimal places
    if (/^\d*\.?\d{0,3}$/.test(rawValue)) {
      setInputValue(rawValue);
    }
  };

  // Converted to milliseconds when submitting
  const handleBlur = () => {
    try {
      let ms = Math.round(Number(inputValue) * 1000);
      if (inputValue === '') {
        ms = timeoutConfig.default;
      }

      if (ms < timeoutConfig.min) {
        ms = timeoutConfig.min;
      }

      if (ms > timeoutConfig.max) {
        ms = timeoutConfig.max;
      }

      onChange?.(ms);

      // echo normalized value
      const seconds = msToSeconds(ms);
      setInputValue(seconds);
    } catch (err) {
      logger.error(err);
    }
  };

  if (timeoutConfig.disabled) {
    return <div>-</div>;
  }

  return (
    <Input
      size="small"
      data-testid="setting-on-error-timeout"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={readonly}
      suffix="s"
    />
  );
};
