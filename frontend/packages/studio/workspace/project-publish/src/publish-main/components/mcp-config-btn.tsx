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
  ConnectorConfigStatus,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { UseMcpConfigModal } from '@/hooks/use-mcp-config-modal';

/** MCP configuration button + pop-up window */
export const McpConfigBtn = ({ record }: { record: PublishConnectorInfo }) => {
  const { node, open } = UseMcpConfigModal({ record });
  return (
    <div
      className="basis-full self-end"
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <Button
        color="primary"
        size="small"
        onClick={() => {
          open();
        }}
      >
        {record.config_status === ConnectorConfigStatus.Configured
          ? I18n.t('enterprise_sso_seetings_page_desc_button1')
          : I18n.t('bot_publish_action_configure')}
      </Button>
      {node}
    </div>
  );
};
