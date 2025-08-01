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

import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { getPluginErrorMessage } from '../utils/error';
import { ROLE_TAG_TEXT_MAP } from '../types';

export const checkOutPluginContext = async (pluginId: string) => {
  const resp = await PluginDevelopApi.CheckAndLockPluginEdit({
    plugin_id: pluginId,
  });

  if (resp.code !== 0) {
    return false;
  }

  const { data } = resp;
  const user = data?.user;

  /**
   * Someone occupies & not themselves
   */
  if (data?.Occupied && user && !user.self) {
    UIModal.info({
      okText: I18n.t('guidance_got_it'),
      title: I18n.t('plugin_team_edit_tip_unable_to_edit'),
      content: `${user.name}(${
        // @ts-expect-error -- linter-disable-autofix
        ROLE_TAG_TEXT_MAP[user.space_roly_type]
      }) ${I18n.t('plugin_team_edit_tip_another_user_is_editing')}`,
      hasCancel: false,
    });

    return true;
  }

  return false;
};

export const unlockOutPluginContext = async (pluginId: string) => {
  const resp = await PluginDevelopApi.UnlockPluginEdit({
    plugin_id: pluginId,
  });

  if (resp.code !== 0) {
    throw new CustomError(
      REPORT_EVENTS.normalError,
      getPluginErrorMessage('unlock out'),
    );
  }
};
