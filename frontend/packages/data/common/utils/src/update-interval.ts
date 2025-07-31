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

import { I18n } from '@coze-arch/i18n';
import { FormatType } from '@coze-arch/bot-api/memory';
import { type DocumentSource } from '@coze-arch/bot-api/knowledge';

import { isFeishuOrLarkDocumentSource } from './feishu-lark';

/**
 * FIXME: Due to backend limitations, the front end needs to remove the 30-day update frequency on the Feishu/Lark path, which can be removed after the subsequent backend is resolved.
 */
export const getUpdateIntervalOptions = (
  params: {
    documentSource?: DocumentSource;
  } = {},
) => {
  const { documentSource } = params;
  return [
    {
      value: 0,
      label: I18n.t('datasets_frequencyModal_frequency_noUpdate'),
    },
    {
      value: 1,
      label: I18n.t('datasets_frequencyModal_frequency_day', {
        num: 1,
      }),
    },
    {
      value: 3,
      label: I18n.t('datasets_frequencyModal_frequency_day', {
        num: 3,
      }),
    },
    {
      value: 7,
      label: I18n.t('datasets_frequencyModal_frequency_day', {
        num: 7,
      }),
    },
    ...(isFeishuOrLarkDocumentSource(documentSource)
      ? []
      : [
          {
            value: 30,
            label: I18n.t('datasets_frequencyModal_frequency_day', {
              num: 30,
            }),
          },
        ]),
  ];
};

export const getAppendUpdateIntervalOptions = () => [
  {
    value: 0,
    label: I18n.t('knowledge_weixin_015'),
  },
  {
    value: 1,
    label: I18n.t('knowledge_weixin_016'),
  },
  {
    value: 3,
    label: I18n.t('knowledge_weixin_017'),
  },
  {
    value: 7,
    label: I18n.t('knowledge_weixin_018'),
  },
];

// Table type Temporarily disables the update type of additional updates, and drops the distinction logic after subsequent support
export const getUpdateTypeOptions = (type: FormatType) => [
  {
    value: 1,
    label: I18n.t('datasets_frequencyModal_whenUpdate_overwrite'),
  },
  {
    value: 2,
    disabled: type === FormatType.Table,
    label: I18n.t('datasets_frequencyModal_whenUpdate_overwrite_keep'),
  },
];
