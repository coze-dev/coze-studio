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

import { debounce } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';

import {
  BaseDelimiterSelector,
  type DelimiterSelectorValue,
} from '@/form-extensions/setters/delimiter-selector';
import { LabelWithTooltip } from '@/form-extensions/components/label-with-tooltip';

import { CONCAT_CHAR_SETTINGS } from '../../constants';
import { type SettingInfo } from './types';

import s from './index.module.less';

const DELAY_TIME = 500;

interface Props {
  readonly?: boolean;
  settingInfo?: SettingInfo;
  value: DelimiterSelectorValue;
  onChange: (value: DelimiterSelectorValue) => void;
}

export const SettingForm = ({
  settingInfo,
  value,
  readonly,
  onChange,
}: Props) => {
  const debouncedChange = debounce(onChange, DELAY_TIME);

  // Prevent trigger node selection
  return (
    <div className={s['setting-form']} onClick={e => e.stopPropagation()}>
      {Boolean(settingInfo?.formTitle) && (
        <Typography.Title className={s['setting-form-title']}>
          {settingInfo?.formTitle}
        </Typography.Title>
      )}

      {Boolean(settingInfo?.formDescription) && (
        <Typography.Paragraph className={s['setting-form-desc']}>
          {settingInfo?.formDescription}
        </Typography.Paragraph>
      )}

      <LabelWithTooltip
        label={I18n.t('workflow_stringprocess_concat_array_symbol_title')}
        tooltip={I18n.t('workflow_textprocess_concat_symbol_tips')}
      />

      <BaseDelimiterSelector
        readonly={!!readonly}
        value={value}
        onChange={debouncedChange}
        options={CONCAT_CHAR_SETTINGS}
      />
    </div>
  );
};
