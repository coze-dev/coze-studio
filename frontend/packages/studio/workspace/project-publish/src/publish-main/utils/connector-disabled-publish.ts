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
  type PublishConnectorInfo,
  ConnectorBindType,
  ConnectorConfigStatus,
} from '@coze-arch/idl/intelligence_api';

// Unconfigured/Authorized Scenario
export const getConnectorNotConfigured = (
  connector: PublishConnectorInfo,
): boolean => {
  const { bind_type, config_status } = connector;
  // Unbound & Unauthorized
  const notConfigured =
    [
      ConnectorBindType.KvBind,
      ConnectorBindType.AuthBind,
      ConnectorBindType.KvAuthBind,
      ConnectorBindType.TemplateBind, // Disable when mcp is not configured, the template is always configured
    ].includes(bind_type) &&
    config_status === ConnectorConfigStatus.NotConfigured;
  return notConfigured;
};

// Scenarios that cannot be published:
// 1. Unbound & Unauthorized
// 2. Those sent by the backend cannot be released (such as: APIs cannot be sent without workflow, templates cannot be sent with private plugins, and channels that cannot be released during review)
export const getDisabledPublish = (
  connector: PublishConnectorInfo,
): boolean => {
  const { allow_publish } = connector;
  // Unbound & Unauthorized
  const notConfigured = getConnectorNotConfigured(connector);

  const connectorDisabled = notConfigured || !allow_publish;

  // The backend of the scenario where the channel cannot be released during the review is issued allow_publish
  return connectorDisabled;
};
