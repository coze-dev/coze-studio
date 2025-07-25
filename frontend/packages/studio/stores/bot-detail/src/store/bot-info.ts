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

/** 定义bot的基础信息*/
export interface BotInfoStore {
  botId: string;
  /** 发布的业务线详情 */
  connectors: Array<ConnectorInfo>;
  /** for前端，发布时间 */
  publish_time: string;
  /** 空间id */
  space_id: string;
  /** 是否已发布 */
  has_publish: boolean;
  mode: BotMode;
  /** 最新发布版本时传发布人 */
  publisher: UserInfo;
  /** bot上架后的商品状态 */
  botMarketStatus: BotMarketStatus;
  /** bot名称 */
  name: string;
  /** bot描述 */
  description: string;
  /** bot 图标uri */
  icon_uri: string;
  /** bot 图标url */
  icon_url: string;
  /** 创建时间 */
  create_time: string;
  /** 创建人id */
  creator_id: string;
  /** 更新时间 */
  update_time: string;
  /** 业务线 */
  connector_id: string;
  /** multi agent mode agent信息 */
  // agents?: Array<Agent>;
  /** 版本，毫秒 */
  version: string;
  /** multi_agent结构体 */
  // multi_agent_info?: MultiAgentInfo;
  /** @ 保存了原始bot数据, readonly **/
  raw: BotInfo;
  /** 抖音分身应用id */
  appId?: string;
  /** 业务类型 默认0 分身业务1  */
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
        // 将botData转化为botInfoStore, 只取BotInfoStore中的固定字段
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
