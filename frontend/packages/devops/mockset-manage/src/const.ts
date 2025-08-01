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
import { type RuleItem } from '@coze-arch/bot-semi/Form';

export const REAL_DATA_ID = '0';

export const REAL_DATA_MOCKSET = {
  id: REAL_DATA_ID,
  name: I18n.t('real_data'),
};

// Initialization only real_data
export const MOCK_OPTION_LIST = [REAL_DATA_MOCKSET];

export const POLLING_INTERVAL = 10000;

export const DELAY_TIME = 2000;

export const CONNECTOR_ID = '10000010';

export const mockSetInfoRules: {
  name: Array<RuleItem>;
  desc: Array<RuleItem>;
} = {
  name: [
    {
      required: true,
      message: I18n.t('please_enter_mockset_name'),
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
  desc: IS_OVERSEA
    ? [
        {
          // eslint-disable-next-line no-control-regex -- regex
          pattern: /^[\x00-\x7F]+$/,
          message: I18n.t('create_plugin_modal_descrip_error'),
        },
      ]
    : [],
};

export const MOCK_SET_ERR_CODE = {
  REPEAT_NAME: 600303100,
};

export enum MockTrafficEnabled {
  DISABLE = 0,
  ENABLE = 1,
}
