import { ToolKey } from '@coze-agent-ide/tool';
import { TableMemory as BaseComponent } from '@coze-agent-ide/space-bot/component';
import { I18n } from '@coze-arch/i18n';

export const TableMemory: React.FC = () => (
  <BaseComponent toolKey={ToolKey.DATABASE} title={I18n.t('bot_database')} />
);
