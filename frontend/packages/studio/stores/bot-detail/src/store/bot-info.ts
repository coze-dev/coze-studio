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
import { produce } from 'immer';
import {
  type BotInfo,
  type GetDraftBotInfoAgwData,
  type UserInfo,
  type BusinessType,
} from '@coze-arch/idl/playground_api';
import {
  BotMarketStatus,
  BotMode,
  type ConnectorInfo,
} from '@coze-arch/bot-api/developer_api';

import {
  type SetterAction,
  setterActionFactory,
} from '../utils/setter-factory';

export const getDefaultBotInfoStore = (): BotInfoStore => ({
  botId: '',
  mode: BotMode.SingleMode,
  botMarketStatus: BotMarketStatus.Offline,
  name: '',
  description: '',
  icon_uri: '',
  icon_url: '',
  create_time: '',
  creator_id: '',
  update_time: '',
  connector_id: '',
  publisher: {},
  has_publish: false,
  connectors: [],
  publish_time: '',
  space_id: '',
  version: '',
  raw: {},
});

/** Define the basic information of the bot*/
export interface BotInfoStore {
  botId: string;
  /** Published business line details */
  connectors: Array<ConnectorInfo>;
  /** For frontend, release time */
  publish_time: string;
  /** Space ID */
  space_id: string;
  /** Has it been published? */
  has_publish: boolean;
  mode: BotMode;
  /** Publisher of the latest release */
  publisher: UserInfo;
  /** The product status after the bot is put on the shelves */
  botMarketStatus: BotMarketStatus;
  /** bot name */
  name: string;
  /** Bot description */
  description: string;
  /** Bot icon uri */
  icon_uri: string;
  /** Bot icon url */
  icon_url: string;
  /** creation time */
  create_time: string;
  /** creator id */
  creator_id: string;
  /** update time */
  update_time: string;
  /** line of business */
  connector_id: string;
  /** Multi agent mode agent information */
  // agents?: Array<Agent>;
  /** Version, ms */
  version: string;
  /** multi_agent structure */
  // multi_agent_info?: MultiAgentInfo;
  /** @Save the original bot data, readonly **/
  raw: BotInfo;
  /** Douyin doppelganger app id */
  appId?: string;
  /** Business Type, Default 0 Clone Business 1  */
  businessType?: BusinessType;
}

export interface BotInfoAction {
  setBotInfo: SetterAction<BotInfoStore>;
  setBotInfoByImmer: (update: (state: BotInfoStore) => void) => void;
  transformVo2Dto: (data: GetDraftBotInfoAgwData) => BotInfoStore;
  initStore: (data: GetDraftBotInfoAgwData) => void;
  clear: () => void;
}

export const useBotInfoStore = create<BotInfoStore & BotInfoAction>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultBotInfoStore(),
      setBotInfo: setterActionFactory<BotInfoStore>(set),
      setBotInfoByImmer: update =>
        set(produce<BotInfoStore>(state => update(state))),
      // eslint-disable-next-line complexity
      transformVo2Dto: data => {
        // Convert botData to botInfoStore, taking only the fixed fields in BotInfoStore
        const botInfo = data.bot_info ?? {};
        return {
          botId: botInfo?.bot_id ?? '',
          mode: botInfo?.bot_mode ?? BotMode.SingleMode,
          botMarketStatus: data.bot_market_status ?? BotMarketStatus.Offline,
          name: botInfo.name ?? '',
          description: botInfo.description ?? '',
          icon_uri: botInfo.icon_uri ?? '',
          icon_url: botInfo.icon_url ?? '',
          create_time: botInfo.create_time ?? '',
          creator_id: botInfo.creator_id ?? '',
          update_time: botInfo.update_time ?? '',
          connector_id: botInfo.connector_id ?? '',
          version: botInfo.version ?? '',
          publisher: data.publisher ?? {},
          has_publish: data.has_publish ?? false,
          connectors: data.connectors ?? [],
          publish_time: data.publish_time ?? '',
          space_id: data.space_id ?? '',
          businessType: botInfo.business_type,
          appId: data.app_id ?? '',
          raw: botInfo,
        };
      },
      initStore: data => {
        const { transformVo2Dto } = get();
        const transformedData = transformVo2Dto(data);
        set(transformedData);
      },
      clear: () => {
        set({ ...getDefaultBotInfoStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.botInfo',
    },
  ),
);
