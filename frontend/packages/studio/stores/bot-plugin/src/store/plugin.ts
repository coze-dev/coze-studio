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

/* eslint-disable @coze-arch/max-line-per-function -- store */
/* eslint-disable max-lines-per-function -- store */
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { getPluginErrorMessage } from '../utils/error';
import { type BotPluginStateAction } from '../types/store/plugin';
import { CreationMethod, ROLE_TAG_TEXT_MAP } from '../types';

export const createPluginStore = (options: {
  pluginID: string;
  spaceID: string;
  projectID?: string;
  version?: string;
}) => {
  const { pluginID, spaceID, projectID, version } = options;

  return create<BotPluginStateAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        version,
        canEdit: !version,
        isUnlocking: false,
        pluginId: pluginID,
        spaceID,
        projectID,
        pluginInfo: {},
        initSuccessed: false,
        getIsIdePlugin: () => {
          const { pluginInfo } = get();

          return pluginInfo?.creation_method === CreationMethod.IDE;
        },
        setInitSuccessed: (v: boolean) =>
          set(
            produce<BotPluginStateAction>(s => {
              s.initSuccessed = v;
            }),
            false,
            'setInitSuccessed',
          ),
        setPluginInfo: info =>
          set(
            produce<BotPluginStateAction>(s => {
              s.pluginInfo = info;
            }),
            false,
            'setPluginInfo',
          ),
        setUpdatedInfo: info =>
          set(
            produce<BotPluginStateAction>(s => {
              s.updatedInfo = info;
            }),
            false,
            'setUpdatedInfo',
          ),
        initUserPluginAuth: async () => {
          const { setCanEdit } = get();
          const resp = await PluginDevelopApi.GetUserAuthority({
            project_id: projectID,
            plugin_id: pluginID,
            creation_method: CreationMethod.COZE,
          });

          if (resp.code !== 0) {
            throw new CustomError(
              REPORT_EVENTS.normalError,
              getPluginErrorMessage('auth init'),
            );
          }

          set(
            produce<BotPluginStateAction>(s => {
              s.auth = resp.data;
            }),
            false,
            'initUserPluginAuth',
          );

          setCanEdit(!!resp.data?.can_edit && !version);
        },
        setCanEdit(can) {
          set(
            produce<BotPluginStateAction>(s => {
              s.canEdit = can;
            }),
            false,
            'setCanEdit',
          );
        },
        wrapWithCheckLock: fn => async () => {
          const { checkPluginIsLockedByOthers } = get();

          const isLocked = await checkPluginIsLockedByOthers();

          if (isLocked) {
            return;
          }

          fn();
        },
        initPlugin: async () => {
          const { pluginId, setPluginInfo } = get();

          const res = await PluginDevelopApi.GetPluginInfo({
            plugin_id: pluginId || '',
            preview_version_ts: version,
          });

          if (res?.code !== 0) {
            throw new CustomError(
              REPORT_EVENTS.normalError,
              getPluginErrorMessage('getPluginInfo error'),
            );
          }
          setPluginInfo({ ...res, plugin_id: pluginId || '' });
        },
        initTool: async () => {
          const { pluginId, setUpdatedInfo } = get();

          const res = await PluginDevelopApi.GetUpdatedAPIs(
            {
              plugin_id: pluginId || '',
            },
            { __disableErrorToast: true },
          );

          if (res?.code !== 0) {
            throw new CustomError(
              REPORT_EVENTS.normalError,
              getPluginErrorMessage('getToolInfo error'),
            );
          }

          setUpdatedInfo({
            updated_api_names: res?.updated_api_names || [],
            created_api_names: res?.created_api_names || [], //For the time being, only the mockset permission of the newly added tool is judged.
          });
        },
        init: async () => {
          const { initPlugin, initTool, initUserPluginAuth, setInitSuccessed } =
            get();
          await Promise.all([initPlugin(), initTool(), initUserPluginAuth()]);
          setInitSuccessed(true);
        },
        checkPluginIsLockedByOthers: async () => {
          const { pluginId, getIsIdePlugin } = get();

          if (getIsIdePlugin()) {
            return false;
          }

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
        },
        unlockPlugin: async () => {
          const { pluginId, canEdit, isUnlocking, getIsIdePlugin } = get();
          if (getIsIdePlugin()) {
            return;
          }

          if (!canEdit) {
            return;
          }

          if (isUnlocking) {
            return;
          }

          try {
            set(
              produce<BotPluginStateAction>(s => {
                s.isUnlocking = true;
              }),
              false,
              'unlocking-true',
            );

            const resp = await PluginDevelopApi.UnlockPluginEdit({
              plugin_id: pluginId,
            });

            if (resp.code !== 0) {
              throw new CustomError(
                REPORT_EVENTS.normalError,
                getPluginErrorMessage('unlock'),
              );
            }
          } finally {
            set(
              produce<BotPluginStateAction>(s => {
                s.isUnlocking = false;
              }),
              false,
              'unlocking-false',
            );
          }
        },
        updatePluginInfoByImmer: updateFn =>
          set(
            produce<BotPluginStateAction>(s => {
              updateFn(s.pluginInfo);
            }),
            false,
            'updatePluginInfoByImmer',
          ),
      })),
      {
        enabled: IS_DEV_MODE,
        name: 'botStudio.botPlugin',
      },
    ),
  );
};
