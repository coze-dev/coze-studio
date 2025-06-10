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
   * 有人占用 & 不是自己
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
