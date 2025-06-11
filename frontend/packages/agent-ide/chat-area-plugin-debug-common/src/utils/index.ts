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
    // 原有逻辑便是在 send message 成功前就上报 tea 了 这时候肯定没有真实的 message_id
    // 原有逻辑也是上报的前端生成的 id 如果后续有问题再改
    message_id: message.extra_info.local_message_id,
    bot_id: botId,
  };
  // 原本逻辑就只在这三个场景 sendTea
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

  // TODO：修改条件这里应该看一下哈～ BOT STORE && SINGLE 不继续
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
    // TODO: 无法判断是否要等待 suggest
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

  // regenerate 消息时 把 currentAgentId 设置为对应 userMessage 的 agentId
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
