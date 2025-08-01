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
  type ConnectorUnionInfo,
  ConnectorClassification,
  type PublishConnectorInfo,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';

export interface ConnectorGroup {
  type: ConnectorClassification;
  label: string;
  desc: string;
  connectors: PublishConnectorInfo[];
}

export function formatConnectorGroups(
  connectors: PublishConnectorInfo[],
  unionMap: Record<string, ConnectorUnionInfo>,
  unions: Record<string, string>,
) {
  const groups: ConnectorGroup[] = [
    {
      type: ConnectorClassification.APIOrSDK,
      label: I18n.t('project_release_api1'),
      desc: I18n.t('project_release_api_sdk_desc'),
      connectors: [],
    },
    {
      type: ConnectorClassification.MiniProgram,
      label: I18n.t('project_release_miniprogram1'),
      desc: I18n.t('project_release_h5_desc'),
      connectors: [],
    },
    {
      type: ConnectorClassification.SocialPlatform,
      label: I18n.t('project_release_social1'),
      desc: I18n.t('project_release_social_desc1'),
      connectors: [],
    },
    {
      type: ConnectorClassification.Coze,
      label: I18n.t('project_release_coze1'),
      desc: I18n.t('project_release_ts_desc'),
      connectors: [],
    },
    {
      type: ConnectorClassification.CozeSpaceExtensionLibrary,
      label: I18n.t('app_publish_connector_mcp'),
      desc: I18n.t('app_publish_connector_mcp'),
      connectors: [],
    },
  ];
  for (const c of connectors) {
    const group = groups.find(g => g.type === c.connector_classification);
    if (!group) {
      continue;
    }
    if (c.connector_union_id) {
      const unionId = c.connector_union_id;
      // If the current union_id has already been added to the group, skip
      if (group.connectors.some(i => i.connector_union_id === unionId)) {
        continue;
      }
      let connectorInfo = c;
      // Give priority to the connector selected by the union, otherwise take the first one.
      const unionSelection = connectors.find(i => i.id === unions[unionId]);
      if (unionSelection) {
        connectorInfo = unionSelection;
      } else {
        const firstId = unionMap[unionId].connector_options[0].connector_id;
        const firstConnector = connectors.find(i => i.id === firstId);
        if (firstConnector) {
          connectorInfo = firstConnector;
        }
      }
      const unionInfo = unionMap[unionId];
      group.connectors.push({
        ...connectorInfo,
        name: unionInfo.name,
        description: unionInfo.description,
        icon_url: unionInfo.icon_url,
      });
    } else {
      group.connectors.push(c);
    }
  }
  return groups;
}
