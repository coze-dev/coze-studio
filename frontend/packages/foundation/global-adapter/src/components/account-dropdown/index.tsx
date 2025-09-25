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

import { useState } from 'react';

import { GlobalLayoutAccountDropdown } from '@coze-foundation/layout';
import { useLogout } from '@coze-foundation/account-ui-adapter';
import { I18n } from '@coze-arch/i18n';
import { useUserInfo } from '@coze-arch/foundation-sdk';
import { IconCozExit, IconCozSetting } from '@coze-arch/coze-design/icons';
import { Dropdown } from '@coze-arch/coze-design';

import { UserInfoMenu } from './user-info-menu';
import { useAccountSettings } from './account-settings';

export const AccountDropdown = () => {
  const [visible, setVisible] = useState(false);
  const userInfo = useUserInfo();
  const { node: logoutModal, open: openLogoutModal } = useLogout();

  const { node: accountSettingsNode, open: openAccountSettings } =
    useAccountSettings();

  if (!userInfo) {
    return null;
  }

  return (
    <GlobalLayoutAccountDropdown
      menus={[
        <UserInfoMenu />,
        <Dropdown.Divider />,
        {
          prefixIcon: <IconCozExit />,
          title: I18n.t('settings_api_authorization'),
          onClick: () => {
            openAccountSettings('api-auth');
          },
          dataTestId: 'layout_avatar_api-auth',
        },
        {
          prefixIcon: <IconCozSetting />,
          title: I18n.t('navi_bar_account_settings'),
          onClick: () => {
            openAccountSettings('account');
          },
          dataTestId: 'layout_avatar_profile-settings',
        },
        <Dropdown.Divider />,
        {
          prefixIcon: <IconCozExit />,
          title: I18n.t('basic_log_out'),
          onClick: () => {
            openLogoutModal();
          },
          dataTestId: 'layout_avatar_logout-button',
        },
      ]}
      visible={visible}
      onVisibleChange={setVisible}
    >
      {logoutModal}
      {accountSettingsNode}
    </GlobalLayoutAccountDropdown>
  );
};
