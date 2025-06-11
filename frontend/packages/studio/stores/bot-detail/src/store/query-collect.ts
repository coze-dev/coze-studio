import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import {
  type BotInfoForUpdate,
  type GetDraftBotInfoAgwData,
  type UserQueryCollectConf,
} from '@coze-arch/idl/playground_api';

import {
  type SetterAction,
  setterActionFactory,
} from '../utils/setter-factory';
export interface QueryCollectStore {
  is_collected: boolean;
  private_policy: string;
}

export const getDefaultQueryCollectStore = (): QueryCollectStore => ({
  is_collected: false,
  private_policy: '',
});

export interface QueryCollectAction {
  setQueryCollect: SetterAction<QueryCollectStore>;
  transformDto2Vo: (data: GetDraftBotInfoAgwData) => UserQueryCollectConf;
  transformVo2Dto: (
    queryCollectConf: UserQueryCollectConf,
  ) => BotInfoForUpdate['user_query_collect_conf'];
  initStore: (data: GetDraftBotInfoAgwData) => void;
  clear: () => void;
}

export const useQueryCollectStore = create<
  QueryCollectStore & QueryCollectAction
>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultQueryCollectStore(),
      setQueryCollect: setterActionFactory<QueryCollectStore>(set),
      transformDto2Vo: botData => {
        const data = botData.bot_info?.user_query_collect_conf;
        return {
          is_collected: data?.is_collected,
          private_policy: data?.private_policy,
        };
      },
      transformVo2Dto: info => info,
      initStore: botData => {
        const { transformDto2Vo } = get();
        set(transformDto2Vo(botData));
      },
      clear: () => {
        set({ ...getDefaultQueryCollectStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.queryCollect',
    },
  ),
);
