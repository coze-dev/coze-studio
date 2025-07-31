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
