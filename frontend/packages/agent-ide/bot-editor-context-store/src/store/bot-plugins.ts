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

// 为了感知 bot/agent 使用 plugin 的封禁状态，同时避免 multi-agent 模式下大量并发/重复请求，这里集中管理 plugin 信息
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
