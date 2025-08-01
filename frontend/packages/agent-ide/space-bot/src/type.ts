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

import { type SetStateAction } from 'react';

import { type PluginPricingRule } from '@coze-arch/bot-api/plugin_develop';
import {
  type BotMode,
  type Branch,
  type BusinessType,
} from '@coze-arch/bot-api/playground_api';
import {
  type ConnectorBrandInfo,
  type PublishConnectorInfo,
  type PublishResultStatus,
  type SubmitBotMarketResult,
} from '@coze-arch/bot-api/developer_api';
import { type BotMonetizationConfigData } from '@coze-arch/bot-api/benefit';

export type ConnectResultInfo = PublishConnectorInfo & {
  publish_status: PublishResultStatus;
  fail_text?: string;
  publish_audit_failed_msg?: string;
};

export interface PublishRef {
  publish: () => void;
}

export interface StoreConfigValue {
  needSubmit: boolean;
  openSource: boolean;
  categoryId: string;
}

export interface PublishResultInfo {
  connectorResult: ConnectResultInfo[];
  marketResult: SubmitBotMarketResult;
  monetizeConfigSuccess?: boolean;
}

export type MouseInValue = Record<string, boolean>;

export interface TableIProp {
  setDataSource: (value: SetStateAction<PublishConnectorInfo[]>) => void;
  setSelectedPlatforms: (selected: SetStateAction<string[]>) => void;
  selectedPlatforms: string[];
  canOpenSource: boolean;
  botInfo: PublisherBotInfo;
  monetizeConfig?: BotMonetizationConfigData;
  setHasCategoryList: (hasCategoryList: SetStateAction<boolean>) => void;
  disabled: boolean;
}

export interface PublishTableProps extends TableIProp {
  dataSource: PublishConnectorInfo[];
  connectorBrandInfoMap: Record<string, ConnectorBrandInfo>;
}

export interface ActionColumnProps extends TableIProp {
  record: PublishConnectorInfo;
  isMouseIn: boolean;
  dataSource: PublishConnectorInfo[];
}

export enum PublishDisabledType {
  NotSelectPlatform = 1,
  NotSelectCategory,
  RespondingChangelog,
  NotSelectIndustry,
}

export interface PublisherBotInfo {
  // bot name
  name: string;
  // Bot description
  description: string;
  // bot prompt
  prompt: string;
  // Bot branch (for multi-person collaborative diff)
  branch?: Branch;
  // Bot mode: single or multi
  botMode?: BotMode;
  // Has it been published?
  hasPublished?: boolean;
  // List of paid plugins
  pluginPricingRules?: Array<PluginPricingRule>;
  // Business Type DouyinAvatar = 1 Douyin Clone
  businessType?: BusinessType;
}
