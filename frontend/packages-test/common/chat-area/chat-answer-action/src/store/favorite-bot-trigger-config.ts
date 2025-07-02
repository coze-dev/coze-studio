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
