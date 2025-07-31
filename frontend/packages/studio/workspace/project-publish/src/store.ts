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
  /** page load status */
  pageLoading: boolean;
  /** Channel list */
  connectorList: PublishConnectorInfo[];
  /** List of channels that need to be aggregated, the key is PublishConnectorInfo ['connector_union_id'] */
  connectorUnionMap: Record<string, ConnectorUnionInfo>;
  /** ID of channel selection */
  selectedConnectorIds: string[];
  /** Whether to display the published results */
  showPublishResult: boolean;
  /** Last released version number */
  lastVersionNumber: string;
  /** version number */
  versionNumber: string;
  /** version description */
  versionDescription: string;
  /** Channel Selection Workflow/ChatFlow */
  connectorPublishConfig: Record<string, ConnectorPublishConfig>;
  /** Chatflow for unified selection of social platform channels */
  socialPlatformChatflow: ConnectorPublishConfig;
  /** Release configuration information, key represents connector_id, value is the parameter of channel release */
  connectors: Record<string, Record<string, string>>;
  /** Aggregate channel selection information, key represents connector_union_id, value is union selection information */
  unions: Record<string, string>;
  /** Whether the template information has been configured */
  templateConfigured: boolean;
  /** Publish result details (poll interface return value) */
  publishRecordDetail: PublishRecordDetail &
    // This information is returned by the PublishProject interface
    // But in order to conform to the existing data flow logic (PublishProject gets the id, polls with the id GetPublishRecordDetail gets the result as the only data source)
    // So the frontend manually spells the value into the polling results
    Pick<PublishProjectData, 'publish_monetization_result'>;
  /** paid configuration */
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
  // The template information has been configured by default (it does not affect the template channel is checked by default). When the template-bind component initializes to obtain the template information, it is set to false on demand.
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
