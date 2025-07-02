import { type Message, type MessageMeta } from '../types';
import { getVerboseContentObj } from '../../utils/verbose';
import { getIsCardDisabled } from '../../utils/message';
import { getIsFunctionCalling } from '../../utils/fucntion-call/get-is-function-calling';
import { getBotState } from './get-bot-state';

export const getInitMetaByMessage = ({
  index,
  messages,
}: {
  index: number;
  messages: Message[];
}): MessageMeta => {
  const msg = messages[index];
  if (!msg) {
    throw new Error(`get message exception: invalid index: ${index}`);
  }
  // TODO: 这里可以留一个 adapter 的口子
  return {
    _fromHistory: msg._fromHistory,
    showActions: false,
    showMultiAgentDivider: false,
    isReceiving: msg.role === 'assistant' && !msg.is_finish,
    isSending: msg.role === 'user' && !msg.is_finish,
    isFunctionCalling: getIsFunctionCalling(index, messages),
    isFail: !!msg._sendFailed,
    message_id: msg.message_id,
    role: msg.role,
    type: msg.type,
    isFromLatestGroup: false,
    isGroupLastMessage: false,
    isGroupLastAnswerMessage: false,
    sectionId: msg.section_id,
    hideAvatar: false,
    botState: getBotState(msg.extra_info.bot_state),
    replyId: msg.reply_id,
    isGroupFirstAnswer: false,
    beforeHasJumpVerbose: false,
    verboseMsgType: getVerboseContentObj(msg.content)?.msg_type || '',
    extra_info: {
      local_message_id: msg.extra_info.local_message_id,
    },
    source: msg.source,
    cardDisabled: getIsCardDisabled(index, messages),
  };
};
