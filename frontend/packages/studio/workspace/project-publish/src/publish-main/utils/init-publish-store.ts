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
 
import {
  ConnectorClassification,
  type ConnectorPublishConfig,
} from '@coze-arch/idl/intelligence_api';
import { MonetizationEntityType } from '@coze-arch/idl/benefit';
import { benefitApi, intelligenceApi } from '@coze-arch/bot-api';

import {
  DEFAULT_VERSION_NUMBER,
  WEB_SDK_CONNECTOR_ID,
} from '@/utils/constants';
import { useProjectPublishStore } from '@/store';

import { type ProjectPublishDraft } from './publish-draft';
import { getFixedVersionNumber } from './get-fixed-version-number';
import { getDisabledPublish } from './connector-disabled-publish';

// eslint-disable-next-line complexity -- it's complex
export async function initPublishStore(
  projectId: string,
  errorHandle: (e: unknown) => void,
  draft?: ProjectPublishDraft,
) {
  const { setProjectPublishInfo, setSelectedConnectorIds, setMonetizeConfig } =
    useProjectPublishStore.getState();
  setProjectPublishInfo({ pageLoading: true });
  try {
    const [publishResp, monetizeConfigResp] = await Promise.all([
      intelligenceApi.PublishConnectorList({
        project_id: projectId,
      }),
      IS_OVERSEA
        ? benefitApi.PublicGetBotMonetizationConfig({
            entity_id: projectId,
            entity_type: MonetizationEntityType.Project,
          })
        : Promise.resolve(undefined),
    ]);
    const {
      connector_list = [],
      last_publish_info = {},
      connector_union_info_map = {},
    } = publishResp.data ?? {};
    const { connector_ids = [], connector_publish_config = {} } =
      last_publish_info;

    // 初始化默认选中的渠道
    const initSelectedConnectors: string[] = [];
    const initConnectors: Record<string, Record<string, string>> = {};
    for (const id of connector_ids) {
      const connector = connector_list.find(c => c.id === id);
      // 过滤掉不允许发布的渠道
      if (!connector || getDisabledPublish(connector)) {
        continue;
      }
      if (connector.connector_union_id) {
        // 对于 union 的 connector ，选中其 union id
        initSelectedConnectors.push(connector.connector_union_id);
        initConnectors[connector.id] = connector.bind_info;
      } else {
        initSelectedConnectors.push(connector.id);
        initConnectors[connector.id] = connector.bind_info;
      }
    }

    // 初始化每个 union 选中的 connector，如果上次没发布该渠道，则选中第一个
    const initUnions: Record<string, string> = {};
    for (const [unionId, info] of Object.entries(connector_union_info_map)) {
      initUnions[unionId] =
        info.connector_options.find(o => connector_ids.includes(o.connector_id))
          ?.connector_id ?? info.connector_options[0].connector_id;
    }

    // 回填社交渠道选择的 chatflow，优先级：
    // 1. draft 中保存的 chatflow
    // 2. 上次发布的第一个 SocialPlatform 选择的 chatflow
    let lastSocialPlatformChatflow: ConnectorPublishConfig | undefined;
    if (draft?.socialPlatformConfig?.selected_workflows?.[0].workflow_id) {
      lastSocialPlatformChatflow = draft.socialPlatformConfig;
    } else {
      for (const c of connector_list) {
        if (
          !initSelectedConnectors.includes(c.id) ||
          c.connector_classification !== ConnectorClassification.SocialPlatform
        ) {
          continue;
        }
        const lastConfig = connector_publish_config[c.id];
        if (lastConfig?.selected_workflows?.[0].workflow_id) {
          lastSocialPlatformChatflow = lastConfig;
          break;
        }
      }
    }

    // 根据 draft 中保存的信息回填 WebSDK 渠道选择的 chatflow
    if (draft?.sdkConfig?.selected_workflows?.[0].workflow_id) {
      connector_publish_config[WEB_SDK_CONNECTOR_ID] = draft.sdkConfig;
    }

    setSelectedConnectorIds(
      draft?.selectedConnectorIds ?? initSelectedConnectors,
    );

    const lastPublishVersionNumber = last_publish_info.version_number;
    // 用户没有 draft 并且存在发布过的版本 则将上一次发布的版本号进行处理
    const fixedVersionNumber = getFixedVersionNumber({
      lastPublishVersionNumber,
      draftVersionNumber: draft?.versionNumber,
      defaultVersionNumber: DEFAULT_VERSION_NUMBER,
    });

    setProjectPublishInfo({
      lastVersionNumber: lastPublishVersionNumber,
      versionNumber: fixedVersionNumber,
      versionDescription: draft?.versionDescription,
      connectorPublishConfig: connector_publish_config,
      connectorList: connector_list,
      connectorUnionMap: connector_union_info_map,
      connectors: initConnectors,
      unions: draft?.unions ?? initUnions,
      socialPlatformChatflow: lastSocialPlatformChatflow,
    });
    setMonetizeConfig(monetizeConfigResp?.data);
  } catch (e) {
    errorHandle(e);
  } finally {
    setProjectPublishInfo({ pageLoading: false });
  }
}
