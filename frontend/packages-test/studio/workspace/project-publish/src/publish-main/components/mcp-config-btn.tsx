import {
  type PublishConnectorInfo,
  ConnectorConfigStatus,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { UseMcpConfigModal } from '@/hooks/use-mcp-config-modal';

/** MCP配置按钮+弹窗 */
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
