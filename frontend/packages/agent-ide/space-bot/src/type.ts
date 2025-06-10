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
  // bot名称
  name: string;
  // bot描述
  description: string;
  // bot prompt
  prompt: string;
  // bot 分支（用于多人协作diff）
  branch?: Branch;
  // bot模式： single or multi
  botMode?: BotMode;
  // 是否发布过
  hasPublished?: boolean;
  // 收费插件列表
  pluginPricingRules?: Array<PluginPricingRule>;
  // 业务类型 DouyinAvatar=1 抖音分身 社区版暂不支持该功能
  businessType?: BusinessType;
}
