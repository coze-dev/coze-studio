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

import { I18n } from '@coze-arch/i18n';
import { IconCozSetting } from '@coze-arch/coze-design/icons';
import { Popover, IconButton } from '@coze-arch/coze-design';

import { type DelimiterSelectorValue } from '@/form-extensions/setters/delimiter-selector';
import { useField, withField } from '@/form';

import { SettingForm } from './setting-form';

import styles from './index.module.less';

export const SettingButtonField = withField(() => {
  const { value, onChange, readonly } = useField<DelimiterSelectorValue>();

  const formSetting = {
    formTitle: I18n.t('workflow_stringprocess_concat_array_title'),
    formDescription: I18n.t('workflow_stringprocess_concat_array_desc'),
  };

  return (
    <Popover
      keepDOM
      stopPropagation
      trigger="click"
      position="bottomRight"
      className={styles['setting-popover']}
      content={
        readonly ? null : (
          <SettingForm
            settingInfo={formSetting}
            value={value as DelimiterSelectorValue}
            onChange={v => {
              onChange?.(v);
            }}
          />
        )
      }
    >
      <IconButton
        size="small"
        disabled={readonly}
        icon={<IconCozSetting className="text-sm" />}
        color="highlight"
      />
    </Popover>
  );
});
