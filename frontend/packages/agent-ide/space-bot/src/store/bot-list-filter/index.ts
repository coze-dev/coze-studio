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
import {
  ListBotDraftType,
  OrderBy,
  PublishStatus,
  type GetDraftBotListRequest,
} from '@coze-arch/bot-api/developer_api';

type TParams = Pick<
  GetDraftBotListRequest,
  | 'order_by'
  | 'bot_name'
  | 'team_bot_type'
  | 'is_publish'
  | 'is_fav'
  | 'cursor_id'
> & {
  pageSize: number;
};

interface BotListFilterStoreState {
  requestParams: TParams;
}

type TSetParamAction<ParamsKey extends keyof TParams> = (
  value: TParams[ParamsKey],
) => void;

interface BotListFilterStoreAction {
  reset: () => void;
  setBotName: TSetParamAction<'bot_name'>;
  setOrder: TSetParamAction<'order_by'>;
  setTeamBotType: TSetParamAction<'team_bot_type'>;
  setPageSize: TSetParamAction<'pageSize'>;
  setPublishStatus: TSetParamAction<'is_publish'>;
  setIsFavorite: TSetParamAction<'is_fav'>;
  setCursorID: TSetParamAction<'cursor_id'>;
}

const defaultState = {
  requestParams: {
    order_by: OrderBy.UpdateTime,
    team_bot_type: ListBotDraftType.TeamBots,
    bot_name: void 0,
    pageSize: 24,
    is_publish: PublishStatus.All,
    is_fav: false,
    cursor_id: '',
  },
} as const;

export const useBotListFilterStore = create<
  BotListFilterStoreState & BotListFilterStoreAction
>()(
  devtools(
    (set, get) => ({
      ...defaultState,
      reset: () => {
        set(defaultState);
      },
      setBotName: name => {
        set({ requestParams: { ...get().requestParams, bot_name: name } });
      },
      setOrder: orderBy => {
        set({ requestParams: { ...get().requestParams, order_by: orderBy } });
      },
      setTeamBotType: teamBotType => {
        set({
          requestParams: { ...get().requestParams, team_bot_type: teamBotType },
        });
      },
      setPageSize: pageSize => {
        set({ requestParams: { ...get().requestParams, pageSize } });
      },
      setPublishStatus: publishStatus => {
        set({
          requestParams: { ...get().requestParams, is_publish: publishStatus },
        });
      },
      setIsFavorite: payload => {
        set({
          requestParams: { ...get().requestParams, is_fav: payload },
        });
      },
      setCursorID: payload => {
        set({
          requestParams: { ...get().requestParams, cursor_id: payload },
        });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botListFilterStore',
    },
  ),
);
