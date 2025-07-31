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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { type BotParticipantInfo } from '@coze-arch/bot-api/developer_api';

type BotId = string;

export type BotParticipantInfoWithId = BotParticipantInfo & { botId: string };

export interface FavoriteBotTriggerConfigState {
  favoriteBotTriggerConfigMap: Record<BotId, BotParticipantInfo>;
}
export interface FavoriteBotTriggerConfigAction {
  updateFavoriteBotTriggerConfigMap: (
    map: Record<BotId, BotParticipantInfo>,
  ) => void;
  updateFavoriteBotTriggerConfigMapByImmer: (
    updateFn: (map: Record<BotId, BotParticipantInfo>) => void,
  ) => void;
  updateMapByConfigList: (list: BotParticipantInfoWithId[]) => void;
  getFavoriteBotConfigIdList: () => BotId[];
  deleteConfigById: (id: BotId) => void;
}

export const createFavoriteBotTriggerConfigStore = () =>
  create<FavoriteBotTriggerConfigState & FavoriteBotTriggerConfigAction>()(
    devtools(
      (set, get) => ({
        favoriteBotTriggerConfigMap: {},
        updateFavoriteBotTriggerConfigMap: map => {
          set(
            {
              favoriteBotTriggerConfigMap: Object.assign(
                {},
                get().favoriteBotTriggerConfigMap,
                map,
              ),
            },
            false,
            'updateFavoriteBotTriggerConfigMap',
          );
        },
        updateMapByConfigList: list => {
          const map = Object.fromEntries(list.map(item => [item.botId, item]));
          set(
            {
              favoriteBotTriggerConfigMap: Object.assign(
                {},
                get().favoriteBotTriggerConfigMap,
                map,
              ),
            },
            false,
            'updateMapByConfigList',
          );
        },
        updateFavoriteBotTriggerConfigMapByImmer: updateFn => {
          set(
            {
              favoriteBotTriggerConfigMap: produce<
                FavoriteBotTriggerConfigState['favoriteBotTriggerConfigMap']
              >(get().favoriteBotTriggerConfigMap, updateFn),
            },
            false,
            'updateFavoriteBotTriggerConfigMapByImmer',
          );
        },
        deleteConfigById: id => {
          set(
            {
              favoriteBotTriggerConfigMap: produce(
                get().favoriteBotTriggerConfigMap,
                map => {
                  delete map[id];
                },
              ),
            },
            false,
            'deleteConfigById',
          );
        },
        getFavoriteBotConfigIdList: () =>
          Object.entries(get().favoriteBotTriggerConfigMap).map(([id]) => id),
      }),
      {
        enabled: IS_DEV_MODE,
        name: 'botStudio.ChatAnswerActionBotTrigger',
      },
    ),
  );

export type FavoriteBotTriggerConfigStore = ReturnType<
  typeof createFavoriteBotTriggerConfigStore
>;
