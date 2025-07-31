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
import { type PluginInfoForPlayground } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

type PluginsIdMap = Record<string, PluginInfoForPlayground>;

export interface DraftBotPluginStoreState {
  pluginsMap: PluginsIdMap;
}

export interface DraftBotPluginStoreAction {
  batchLoad: (pluginIds: string[], spaceId: string) => Promise<void>;
  update: (pluginInfo: PluginInfoForPlayground) => void;
}

const getDefaultState = (): DraftBotPluginStoreState => ({
  pluginsMap: {},
});

export const createDraftBotPluginsStore = () =>
  create<DraftBotPluginStoreState & DraftBotPluginStoreAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        ...getDefaultState(),
        batchLoad: async (pluginIds, spaceId) => {
          const { pluginsMap } = get();
          const newPluginIds = pluginIds.filter(id => !pluginsMap[id]);
          if (newPluginIds.length) {
            const res = await PluginDevelopApi.GetPlaygroundPluginList({
              page: 1,
              size: pluginIds.length,
              plugin_ids: pluginIds,
              space_id: spaceId,
              is_get_offline: true,
              plugin_types: [1],
            });
            set({
              pluginsMap: res.data?.plugin_list?.reduce<PluginsIdMap>(
                (map, item) => ({
                  ...map,
                  [item.id ?? '']: item,
                }),
                {
                  ...get().pluginsMap,
                },
              ),
            });
          }
        },
        update: plugin => {
          set({
            pluginsMap: {
              ...get().pluginsMap,
              [plugin.id ?? '']: plugin,
            },
          });
        },
      })),
    ),
  );

export type DraftBotPluginsStore = ReturnType<
  typeof createDraftBotPluginsStore
>;
