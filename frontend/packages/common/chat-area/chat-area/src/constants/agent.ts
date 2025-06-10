import { AgentType } from '@coze-arch/bot-api/developer_api';

// TODO: 这里为啥没i18n需要做
// 节点类型名称映射关系
export const agentTypeNameMap: { [key in AgentType]: string | undefined } = {
  [AgentType.LLM_Agent]: 'Agent',
  [AgentType.Bot_Agent]: 'Bot',
  [AgentType.Global_Agent]: 'Bot',
  [AgentType.Start_Agent]: 'Bot',
  [AgentType.Task_Agent]: 'Bot',
};
