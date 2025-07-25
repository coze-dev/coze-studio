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
import { produce as immerProduce } from 'immer';
import {
  type PublishConnectorInfo,
  type ConnectorPublishConfig,
  type PublishRecordDetail,
  type PublishProjectData,
  type ConnectorUnionInfo,
} from '@coze-arch/idl/intelligence_api';
import { type BotMonetizationConfigData } from '@coze-arch/bot-api/benefit';

import { setterActionFactory, type SetterAction } from './utils/setter-factory';
import { WEB_SDK_CONNECTOR_ID } from './utils/constants';
import { type ProjectPublishDraft } from './publish-main/utils/publish-draft';

export type StoreBindKey = 'display_screen' | 'category_id';

export interface ProjectPublishStore {
  /** 页面加载状态 */
  pageLoading: boolean;
  /** 渠道列表 */
  connectorList: PublishConnectorInfo[];
  /** 需要聚合的渠道列表，key 是 PublishConnectorInfo['connector_union_id'] */
  connectorUnionMap: Record<string, ConnectorUnionInfo>;
  /** 渠道选择的id */
  selectedConnectorIds: string[];
  /** 是否展示发布结果 */
  showPublishResult: boolean;
  /** 上次发布的版本号 */
  lastVersionNumber: string;
  /** 版本号 */
  versionNumber: string;
  /** 版本描述 */
  versionDescription: string;
  /** 渠道选择的Workflow/ChatFlow */
  connectorPublishConfig: Record<string, ConnectorPublishConfig>;
  /** 社交平台渠道统一选择的 chatflow */
  socialPlatformChatflow: ConnectorPublishConfig;
  /** 发布配置信息，key代表connector_id，value是渠道发布的参数 */
  connectors: Record<string, Record<string, string>>;
  /** 聚合渠道的选择信息，key代表connector_union_id，value是union的选择信息 */
  unions: Record<string, string>;
  /** 是否已经配置过模板信息 */
  templateConfigured: boolean;
  /** 发布结果详情（轮询接口返回值） */
  publishRecordDetail: PublishRecordDetail &
    // 该信息由 PublishProject 接口返回
    // 但为了符合现有数据流转逻辑（PublishProject 拿到 id，用 id 轮询 GetPublishRecordDetail 拿到结果作为唯一数据源）
    // 因此前端手动将该值拼到轮询结果中
    Pick<PublishProjectData, 'publish_monetization_result'>;
  /** 付费配置 */
  monetizeConfig?: BotMonetizationConfigData;
}

interface ProjectPublishAction {
  reset: () => void;
  setMonetizeConfig: (
    monetizeConfig: BotMonetizationConfigData | undefined,
  ) => void;
  setConnectorList: (connectorList: PublishConnectorInfo[]) => void;
  setSelectedConnectorIds: (selectedConnectorIds: string[]) => void;
  updateSelectedConnectorIds: (produce: (prev: string[]) => string[]) => void;
  setShowPublishResult: (showPublishResult: boolean) => void;
  setProjectPublishInfo: SetterAction<ProjectPublishStore>;
  setProjectPublishInfoByImmer: (
    updateFn: (draft: ProjectPublishStore['connectorPublishConfig']) => void,
  ) => void;
  setPublishRecordDetail: (
    val: Partial<ProjectPublishStore['publishRecordDetail']>,
  ) => void;
  resetProjectPublishInfo: () => void;
  exportDraft: (projectId: string) => ProjectPublishDraft;
}

const initialStore: ProjectPublishStore = {
  connectorList: [],
  connectorUnionMap: {},
  selectedConnectorIds: [],
  showPublishResult: false,
  lastVersionNumber: '',
  versionNumber: '',
  versionDescription: '',
  connectorPublishConfig: {},
  socialPlatformChatflow: {},
  // 默认已经配置过模板信息（不影响模板渠道默认勾选），当 template-bind 组件初始化获取到模板信息后，再按需设置为 false
  templateConfigured: true,
  connectors: {},
  unions: {},
  publishRecordDetail: {},
  pageLoading: false,
};

export const useProjectPublishStore = create<
  ProjectPublishStore & ProjectPublishAction
>()(
  devtools(
    (set, get) => ({
      ...initialStore,

      reset: () => {
        set(initialStore);
      },
      setMonetizeConfig: monetizeConfig => set({ monetizeConfig }),
      setConnectorList: connectorList => {
        set({ connectorList });
      },
      setSelectedConnectorIds: selectedConnectorIds => {
        set({ selectedConnectorIds });
      },
      updateSelectedConnectorIds: produce => {
        set(prev => ({
          selectedConnectorIds: produce(prev.selectedConnectorIds),
        }));
      },
      setShowPublishResult: showPublishResult => {
        set({ showPublishResult });
      },
      setProjectPublishInfo: setterActionFactory<ProjectPublishStore>(set),
      setProjectPublishInfoByImmer: updateFn => {
        set(
          {
            connectorPublishConfig: immerProduce(
              get().connectorPublishConfig,
              updateFn,
            ),
          },
          false,
          'setProjectPublishInfoByImmer',
        );
      },
      setPublishRecordDetail: publishRecordDetail =>
        set(prev => ({
          publishRecordDetail: {
            ...prev.publishRecordDetail,
            ...publishRecordDetail,
          },
        })),
      resetProjectPublishInfo: () => {
        set(initialStore);
      },
      exportDraft: (projectId: string) => {
        const {
          versionNumber,
          versionDescription,
          selectedConnectorIds,
          connectorPublishConfig,
          unions,
          socialPlatformChatflow,
        } = get();
        return {
          projectId,
          versionNumber,
          versionDescription,
          selectedConnectorIds,
          unions,
          sdkConfig: connectorPublishConfig[WEB_SDK_CONNECTOR_ID],
          socialPlatformConfig: socialPlatformChatflow,
        };
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.projectPublishStore',
    },
  ),
);
