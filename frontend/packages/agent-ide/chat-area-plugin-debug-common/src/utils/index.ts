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

import { cloneDeep, merge } from 'lodash-es';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import {
  useBotInfoStore,
  type BotInfoStore,
} from '@coze-studio/bot-detail-store/bot-info';
import { useManuallySwitchAgentStore } from '@coze-studio/bot-detail-store';
import {
  type OnBeforeSendMessageContext,
  Scene,
  ContentType,
  type Message,
  getBotState,
  type MessageExtraInfoBotState,
} from '@coze-common/chat-area';
import { messageReportEvent, safeJSONParse } from '@coze-arch/bot-utils';
import {
  EVENT_NAMES,
  type ParamsTypeDefine,
  sendTeaEvent,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { BotMode } from '@coze-arch/bot-api/developer_api';
import { TrafficScene } from '@coze-arch/bot-api/debugger_api';

export enum MockTrafficEnabled {
  DISABLE = 0,
  ENABLE = 1,
}

export function getMockSetReqOptions(baseBotInfo: BotInfoStore) {
  return {
    headers: {
      'rpc-persist-mock-traffic-scene':
        baseBotInfo.mode === BotMode.MultiMode
          ? TrafficScene.CozeMultiAgentDebug
          : TrafficScene.CozeSingleAgentDebug,
      'rpc-persist-mock-traffic-caller-id': baseBotInfo.botId,
      'rpc-persist-mock-space-id': baseBotInfo?.space_id,
      'rpc-persist-mock-traffic-enable': MockTrafficEnabled.ENABLE,
    },
  };
}

export const sendTeaEventOnBeforeSendMessage = (params: {
  message: Message<ContentType>;
  from: string;
  botId: string;
}) => {
  const { message, from, botId } = params;
  const { isSelf } = usePageRuntimeStore.getState();
  const teaParam: Omit<
    ParamsTypeDefine[EVENT_NAMES.click_send_message],
    'from'
  > = {
    is_user_owned: isSelf ? 'true' : 'false',
    message_id: message.extra_info.local_message_id,
    bot_id: botId,
  };
  // The original logic is only in these three scenes sendTea
  if (from === 'inputAndSend') {
    sendTeaEvent(EVENT_NAMES.click_send_message, {
      from: 'type',
      ...teaParam,
    });
  }
  if (from === 'regenerate') {
    sendTeaEvent(EVENT_NAMES.click_send_message, {
      from: 'regenerate',
      ...teaParam,
    });
  }
  if (from === 'suggestion') {
    sendTeaEvent(EVENT_NAMES.click_send_message, {
      from: 'welcome_message_suggestion',
      ...teaParam,
    });
  }
};

export const handleBotStateBeforeSendMessage = (
  params: OnBeforeSendMessageContext,
  scene: Scene,
) => {
  const { message, options } = params;
  const { mode } = useBotInfoStore.getState();

  if (scene !== Scene.Playground && mode !== BotMode.MultiMode) {
    return;
  }

  const clonedOptions: typeof options = cloneDeep(options ?? {});

  if (scene === Scene.Playground) {
    merge(clonedOptions, {
      extendFiled: {
        space_id: useSpaceStore.getState().getSpaceId(),
      },
    });
  }

  if (mode === BotMode.MultiMode) {
    updateAgentBeforeSendMessage(params);
    const botState = getBotStateBeforeSendMessage();
    merge(clonedOptions, {
      extendFiled: {
        extra: { bot_state: JSON.stringify(botState) },
      },
    });
  }

  const baseBotInfo = useBotInfoStore.getState();
  merge(clonedOptions, getMockSetReqOptions(baseBotInfo));

  return {
    message,
    options: clonedOptions,
  };
};

export const isCreateTaskMessage = (message: Message<ContentType>) => {
  if (
    typeof message === 'object' &&
    message.type === 'tool_response' &&
    message.content_type === ContentType.Text
  ) {
    const messageContentObject = safeJSONParse(message.content);
    if (
      typeof messageContentObject === 'object' &&
      messageContentObject.response_for_model === 'Task created successfully'
    ) {
      return true;
    }
  }
  return false;
};

export const reportReceiveEvent = (message: Message<ContentType>) => {
  if (message.type === 'follow_up') {
    messageReportEvent.messageReceiveSuggestsEvent.receiveSuggest();
    return;
  }
  messageReportEvent.receiveMessageEvent.receiveMessage(message);
  if (message.type === 'answer' && message.is_finish) {
    messageReportEvent.receiveMessageEvent.finish(message);
    messageReportEvent.receiveMessageEvent.start();
  }
};

export const updateAgentBeforeSendMessage: (
  param: OnBeforeSendMessageContext,
) => void = ({ message, options }) => {
  if (!(options?.isRegenMessage && message.role === 'user')) {
    return;
  }

  const {
    currentAgentID,
    updatedCurrentAgentIdWithConnectStart,
    setMultiAgent,
  } = useMultiAgentStore.getState();

  const regeneratedMessageBotState = getBotState(message.extra_info.bot_state);

  // When regenerating the message, set the currentAgentId to the agentId corresponding to the userMessage.
  const fixedAgentId =
    currentAgentID === useManuallySwitchAgentStore.getState().agentId
      ? currentAgentID
      : regeneratedMessageBotState?.agent_id;

  if (fixedAgentId) {
    setMultiAgent({ currentAgentID: fixedAgentId });
  } else {
    updatedCurrentAgentIdWithConnectStart();
  }
};

export const getBotStateBeforeSendMessage: () => MessageExtraInfoBotState =
  () => {
    const { botId } = useBotInfoStore.getState();
    const { currentAgentID } = useMultiAgentStore.getState();
    const botState: MessageExtraInfoBotState = {
      agent_id: currentAgentID,
      bot_id: botId,
    };
    return botState;
  };
