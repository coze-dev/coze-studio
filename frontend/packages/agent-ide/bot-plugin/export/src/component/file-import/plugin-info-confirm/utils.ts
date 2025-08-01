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

import { type UploadValue } from '@coze-common/biz-components';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { type PluginMetaInfo } from '@coze-arch/bot-api/developer_api';

export const formRuleList = {
  name: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_name1_error'),
    },
    IS_OVERSEA
      ? {
          pattern: /^[\w\s]+$/,
          message: I18n.t('create_plugin_modal_nameerror'),
        }
      : {
          pattern: /^[\w\s\u4e00-\u9fa5]+$/u, // Increased domestic support for Chinese
          message: I18n.t('create_plugin_modal_nameerror_cn'),
        },
  ],
  desc: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_descrip1_error'),
    },
    IS_OVERSEA && {
      // eslint-disable-next-line no-control-regex -- regex
      pattern: /^[\x00-\x7F]+$/,
      message: I18n.t('create_plugin_modal_descrip_error'),
    },
  ],
  url: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_url1_error'),
    },
  ],
  key: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_Parameter_error'),
    },
    {
      // eslint-disable-next-line no-control-regex -- regex
      pattern: /^[\x00-\x7F]+$/,
      message: I18n.t('plugin_Parametename_error'),
    },
  ],
  service_token: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_Servicetoken_error'),
    },
  ],
};

export const getPictureUploadInitValue = (
  info?: PluginMetaInfo,
): UploadValue | undefined => {
  if (!info) {
    return;
  }
  return [
    {
      url: info.icon?.url || '',
      uid: info?.icon?.uri || '',
    },
  ];
};

export interface AuthOption {
  label: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any
  [key: string]: any;
}
/** Recursively find the input under the auth option */
// @ts-expect-error -- linter-disable-autofix
export const findAuthTypeItem = (data: AuthOption[], targetKey = 0) => {
  for (const item of data) {
    if (item.value === targetKey) {
      return item;
    } else if (item.children?.length > 0) {
      return findAuthTypeItem(item.children, targetKey);
    }
  }
};

export function getAuthOptions(authSchema?: string): Array<AuthOption> {
  const authOptions: AuthOption[] = [
    {
      label: I18n.t('create_plugin_modal_Authorization_no'),
      value: 0,
      key: 'None',
    },
    {
      label: I18n.t('create_plugin_modal_Authorization_service'),
      value: 1,
      key: 'Service',
    },
    {
      label: I18n.t('create_plugin_modal_Authorization_oauth'),
      value: 3,
      key: 'OAuth',
      children: safeJSONParse(authSchema),
    },
  ];
  return authOptions;
}
