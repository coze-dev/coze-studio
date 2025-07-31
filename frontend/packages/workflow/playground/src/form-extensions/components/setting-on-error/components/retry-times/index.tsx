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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { type SettingOnErrorItemProps } from '../../types';

/**
 * number of retries
 */
export const RetryTimes: FC<SettingOnErrorItemProps<number>> = ({
  value,
  onChange,
  readonly,
}) => (
  <Select
    size="small"
    data-testid="setting-on-error-retry-times"
    optionList={[
      { label: I18n.t('workflow_250416_06', undefined, '不重试'), value: 0 },
      { label: I18n.t('workflow_250416_07', undefined, '重试1次'), value: 1 },
    ]}
    value={value ?? 0}
    onChange={v => {
      onChange?.(v as number);
    }}
    disabled={readonly}
  />
);
