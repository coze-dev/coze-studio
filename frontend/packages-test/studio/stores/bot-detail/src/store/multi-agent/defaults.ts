import { I18n } from '@coze-arch/i18n';

import type { AgentBizInfo } from '../../types/agent';

export const DEFAULT_AGENT_BIZ_INFO = (): AgentBizInfo => ({});
export const DEFAULT_AGENT_DESCRIPTION = () =>
  I18n.t('multiagent_node_scenarios_context_default');
