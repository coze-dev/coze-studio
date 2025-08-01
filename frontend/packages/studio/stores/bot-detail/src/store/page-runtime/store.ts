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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { size } from 'lodash-es';
import { produce } from 'immer';
import dayjs from 'dayjs';
import { type GetDraftBotInfoAgwData } from '@coze-arch/idl/playground_api';
import { type BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { SpaceApi } from '@coze-arch/bot-space-api';
import {
  type GetDraftBotDisplayInfoResponse,
  type TabDisplayItems,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { useBotInfoStore } from '../bot-info';
import {
  type SetterAction,
  setterActionFactory,
} from '../../utils/setter-factory';
import { DEFAULT_BOT_SKILL_BLOCK_COLLAPSIBLE_STATE } from './defaults';

interface SavingInfo {
  saving: boolean;
  time: string;
  debouncing?: boolean;
  scopeKey?: string;
  triggerType?: string;
}
export const getDefaultPageRuntimeStore = (): PageRuntime => ({
  init: false,
  isSelf: false,
  isPreview: false,
  editable: false,
  savingInfo: {
    saving: false,
    time: dayjs().format('HH:mm:ss'),
    debouncing: false,
    scopeKey: '',
    triggerType: '',
  },
  historyVisible: false,
  botSkillBlockCollapsibleState: {},
  grabPluginId: '',
  hasUnpublishChange: false,
});

// Editor state control for bot
export interface PageRuntime {
  /** Initialization **/
  init: boolean;
  /** Is the current user the creator of the bot?*/
  isSelf: boolean;
  /** Is it preview status isPreview = typeof version! == 'undefined'; **/
  isPreview: boolean;
  /** Server level passthrough **/
  editable: boolean;
  /**Control bot history version display **/
  historyVisible?: boolean;

  /**  Record the status of the user actively expanding/retracting the bot capability module **/
  botSkillBlockCollapsibleState: TabDisplayItems;
  /** Page Source **/
  pageFrom?: BotPageFromEnum;
  /** Save information **/
  savingInfo: SavingInfo;
  /** Dashword plugin id, one chat-area one **/
  grabPluginId: string;
  /** Are there any unpublished changes, header display **/
  hasUnpublishChange: boolean;
}

export type InitStoreData = GetDraftBotInfoAgwData & { customVersion?: string };
export interface PageRuntimeAction {
  setPageRuntimeBotInfo: SetterAction<PageRuntime>;
  setPageRuntimeByImmer: (update: (state: PageRuntime) => void) => void;
  getBotSkillBlockCollapsibleState: () => Promise<void>;
  setBotSkillBlockCollapsibleState: (
    $params: TabDisplayItems,
    disableUpdateService?: boolean,
  ) => void;
  getIsPreview: (version?: string) => boolean;
  initStore: (data: InitStoreData) => void;
  clear: () => void;
}

export const usePageRuntimeStore = create<PageRuntime & PageRuntimeAction>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultPageRuntimeStore(),
      setPageRuntimeBotInfo: setterActionFactory<PageRuntime>(set),
      setPageRuntimeByImmer: update =>
        set(produce<PageRuntime>(state => update(state))),

      /**
       * Get the status of the user's active expand/collapse bot capability module
       * ⚠️ Called only when opening my bot edit page for the first time
       * @see
       */
      getBotSkillBlockCollapsibleState: async () => {
        try {
          const resp: GetDraftBotDisplayInfoResponse =
            await SpaceApi.GetDraftBotDisplayInfo({
              bot_id: useBotInfoStore.getState().botId,
            });
          const botSkillBlockCollapsibleState =
            resp.data?.tab_display_info ??
            DEFAULT_BOT_SKILL_BLOCK_COLLAPSIBLE_STATE();

          set(prevState => ({
            ...prevState,
            botSkillBlockCollapsibleState,
          }));
        } catch (error) {
          set(prevState => ({
            ...prevState,
            botSkillBlockCollapsibleState:
              DEFAULT_BOT_SKILL_BLOCK_COLLAPSIBLE_STATE(),
          }));
          throw error;
        }
      },
      /**
       * Stores the status of the user's active expand/retract bot capability module
       * ⚠️ Only record when active
       * @see
       */
      setBotSkillBlockCollapsibleState: (
        $params: TabDisplayItems,
        disableUpdateService?: boolean,
      ) => {
        if (size($params) > 0) {
          // Record to local finite-state machine
          set({
            ...get(),
            botSkillBlockCollapsibleState: {
              ...get().botSkillBlockCollapsibleState,
              ...$params,
            },
          });

          if (disableUpdateService) {
            return;
          }

          // Synchronize to server level
          DeveloperApi.UpdateDraftBotDisplayInfo({
            bot_id: useBotInfoStore.getState().botId,
            display_info: { tab_display_info: $params },
            space_id: useBotInfoStore.getState().space_id,
          });
        }
      },
      getIsPreview: version => typeof version !== 'undefined',
      initStore: info => {
        const { getIsPreview } = get();
        set({
          init: true,
          isPreview: getIsPreview(info?.customVersion),
          editable: info?.editable,
          savingInfo: { saving: false, time: dayjs().format('HH:mm:ss') },
          hasUnpublishChange: Boolean(info.has_unpublished_change),
        });
      },
      clear: () => {
        set({ ...getDefaultPageRuntimeStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.pageRuntime',
    },
  ),
);
