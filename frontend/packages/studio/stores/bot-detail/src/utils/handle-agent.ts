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
 
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';
import { MultiAgentSessionType } from '@coze-arch/bot-api/playground_api';

import { useMultiAgentStore } from '../store/multi-agent';
import { useManuallySwitchAgentStore } from '../store/manually-switch-agent-store';
import { saveDeleteAgents } from '../save-manager/manual-save/multi-agent';
import { findTargetAgentIndex } from './find-agent';

/**
 * FG全量后，默认用结构化的新接口
 */
export const deleteAgent = async (agentId?: string) => {
  if (!agentId) {
    return;
  }
  await saveDeleteAgents(agentId);
  useMultiAgentStore.getState().setMultiAgentByImmer(multiAgent => {
    const { agents } = multiAgent;
    // 找到要删除的位置
    const targetAgentIndex = findTargetAgentIndex(agents, agentId);
    if (targetAgentIndex < 0) {
      Toast.error(I18n.t('chatflow_error_delete_failed'));
      return;
    }
    // 删除当前的agent
    agents.splice(targetAgentIndex, 1);
  });
};

/**
 * 用户手动切换 chatting 节点
 *
 * host 模式下会一并切换 host 节点
 */
export const manuallySwitchAgent = (agentID: string) => {
  const { setMultiAgentByImmer } = useMultiAgentStore.getState();
  useManuallySwitchAgentStore
    .getState()
    .recordAgentIdOnManuallySwitchAgent(agentID);
  setMultiAgentByImmer(multiAgent => {
    multiAgent.currentAgentID = agentID;
    if (multiAgent.chatModeConfig.type === MultiAgentSessionType.Host) {
      multiAgent.chatModeConfig.currentHostId = agentID;
    }
  });
};
