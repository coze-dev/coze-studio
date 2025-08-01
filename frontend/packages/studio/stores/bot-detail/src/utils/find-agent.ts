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

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';
import { AgentType } from '@coze-arch/bot-api/developer_api';

import type { BotMultiAgent, Agent } from '../types/agent';

export const findFirstAgent = (
  multiAgent: BotMultiAgent,
): Agent | undefined => {
  const startNode = multiAgent.agents.find(
    agent => agent.agent_type === AgentType.Start_Agent,
  );
  if (!startNode) {
    Toast.error({
      content: withSlardarIdButton(I18n.t('chatflow_error_miss_start')),
    });
    return;
  }
  const firstAgentId = multiAgent.edges.find(
    edge => edge.sourceNodeID === startNode.id,
  )?.targetNodeID;
  if (!firstAgentId) {
    Toast.error({
      content: withSlardarIdButton(I18n.t('chatflow_error_miss_start_agent')),
    });
    return;
  }
  return findTargetAgent(multiAgent.agents, firstAgentId);
};

export const findTargetAgent = (agents: Agent[], agentId?: string) => {
  if (!agentId) {
    return;
  }
  return agents.find(item => item.id === agentId);
};

/** Find an agent whose intent next_agent_id the current agent id. */
export const findAgentByNextIntentID = (
  agents: Agent[],
  nextAgentID?: string,
) => {
  if (!nextAgentID) {
    return;
  }
  return agents.find(item =>
    (item.intents || []).some(intent => intent.next_agent_id === nextAgentID),
  );
};

export const findTargetAgentIndex = (agents: Agent[], agentId?: string) => {
  if (!agentId) {
    return -1;
  }
  return agents.findIndex(item => item.id === agentId);
};

/**
 * The node id pointed to by the start node
 */
export const findFirstAgentId = ({
  agents,
}: Pick<BotMultiAgent, 'agents'>): string | undefined => {
  const startNode = agents.find(
    agent => agent.agent_type === AgentType.Start_Agent,
  );
  return startNode?.intents?.at(0)?.next_agent_id;
};
