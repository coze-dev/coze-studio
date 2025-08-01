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

import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  getBotState,
  type WriteableCommandLifeCycleServiceGenerator,
} from '@coze-common/chat-area';
import {
  BotMode,
  MultiAgentSessionType,
} from '@coze-arch/bot-api/developer_api';

import { type PluginBizContext } from '../../types/biz-context';

export const commandLifeCycleServiceGenerator: WriteableCommandLifeCycleServiceGenerator<
  PluginBizContext
> = _ => ({
  onAfterClearHistory() {
    const {
      chatModeConfig,
      updatedCurrentAgentIdWithConnectStart,
      resetHostAgent,
    } = useMultiAgentStore.getState();
    const { mode } = useBotInfoStore.getState();
    if (mode === BotMode.MultiMode) {
      updatedCurrentAgentIdWithConnectStart();
      if (chatModeConfig.type === MultiAgentSessionType.Host) {
        resetHostAgent();
      }
    }
  },
  onAfterStopResponding(ctx) {
    const { brokenFlattenMessageGroup: brokenMessages } = ctx;
    const { mode } = useBotInfoStore.getState();
    const { chatModeConfig, setMultiAgent } = useMultiAgentStore.getState();

    if (
      mode !== BotMode.MultiMode ||
      chatModeConfig.type !== MultiAgentSessionType.Host
    ) {
      return;
    }

    const hostAgentId = chatModeConfig.currentHostId;
    const targetMessage = brokenMessages
      ?.filter(msg => msg.role === 'assistant' && msg.type === 'answer')
      .at(-1);
    if (!targetMessage) {
      setMultiAgent({ currentAgentID: hostAgentId });
      return;
    }

    const parsedBotState = getBotState(targetMessage.extra_info.bot_state);
    if (!parsedBotState?.awaiting) {
      setMultiAgent({ currentAgentID: hostAgentId });
      return;
    }

    setMultiAgent({ currentAgentID: parsedBotState.awaiting });
  },
});
