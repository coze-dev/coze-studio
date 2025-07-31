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
  // TODO: You can leave an adapter opening here
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
