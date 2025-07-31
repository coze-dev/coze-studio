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

import { PatBody } from '@coze-studio/open-auth';
import {
  useAccountSettings as useBaseAccountSettings,
  UserInfoPanel,
} from '@coze-foundation/account-ui-base';
import { I18n } from '@coze-arch/i18n';

export const useAccountSettings = () => {
  const tabs = [
    {
      id: 'account',
      tabName: I18n.t('menu_profile_account'),
      content: () => <UserInfoPanel />,
    },
    {
      id: 'api-auth',
      tabName: I18n.t('settings_api_authorization'),
      content: () => <PatBody size="small" type="primary" />,
    },
  ];

  const { node, open } = useBaseAccountSettings({
    tabs,
  });
  return {
    node,
    open,
  };
};
