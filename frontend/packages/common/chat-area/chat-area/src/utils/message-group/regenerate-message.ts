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

import { type Reporter } from '@coze-arch/logger';

import { findMessageById, getMessageUniqueKey } from '../message';
import { getRegenerateMessage } from '../get-regenerate-message';
import { type MessageGroup } from '../../store/types';
import { type ChatActionLockService } from '../../service/chat-action-lock';
import { type useSendMessageAndAutoUpdate } from '../../hooks/messages/use-send-message/new-message';
import { type StoreSet } from '../../context/chat-area-context/type';
import { checkNoneMessageGroupMemberLeft } from './message-group-exhaustive-check';
import { debugAllMessageGroups, debugMessageGroup } from './debug-message-group';

export const regenerateMessage = async ({
  messageGroup,
  context: { storeSet, chatActionLockService, reporter, sendMessage },
}: {
  messageGroup: MessageGroup;
  context: {
    storeSet: Pick<StoreSet, 'useSuggestionsStore' | 'useMessagesStore'>;
    chatActionLockService: ChatActionLockService;
    reporter: Reporter;
    sendMessage: ReturnType<typeof useSendMessageAndAutoUpdate>;
  };
}) => {
  const { memberSet, groupId } = messageGroup;
  if (chatActionLockService.answerAction.getIsLock(groupId, 'regenerate')) {
    return;
  }
  if (chatActionLockService.globalAction.getIsLock('sendMessageToACK')) {
    return;
  }
  const { useMessagesStore, useSuggestionsStore } = storeSet;
  const { clearSuggestions } = useSuggestionsStore.getState();
  const { deleteMessageByIdList, messages, messageGroupList } =
    useMessagesStore.getState();
  const {
    userMessageId: initialUserMessageId,
    llmAnswerMessageIdList,
    functionCallMessageIdList,
    followUpMessageIdList,
    ...rest
  } = memberSet;
  let userMessageId = initialUserMessageId;
  checkNoneMessageGroupMemberLeft(rest);

  if (!userMessageId) {
    // 调试信息
    debugMessageGroup(messageGroup, messages, 'Regenerate - Missing UserMessageId');
    debugAllMessageGroups(messageGroupList, messages);
    
    // 优先尝试直接根据 groupId 匹配用户消息
    const directUserMessage = messages.find(
      msg => msg.role === 'user' && getMessageUniqueKey(msg) === groupId,
    );

    if (directUserMessage) {
      userMessageId = getMessageUniqueKey(directUserMessage);
      console.log('[Regenerate] Found user message via groupId:', userMessageId);
    } else {
      // 尝试根据回答消息的 reply_id 反查用户消息
      const answerMessageId = llmAnswerMessageIdList.at(0);
      const answerMessage = answerMessageId
        ? findMessageById(messages, answerMessageId)
        : undefined;
      const candidateUserId = answerMessage?.reply_id;
      if (candidateUserId) {
        const candidateUserMessage =
          findMessageById(messages, candidateUserId) ||
          messages.find(
            msg =>
              msg.role === 'user' &&
              getMessageUniqueKey(msg) === candidateUserId,
          );
        if (candidateUserMessage) {
          userMessageId = getMessageUniqueKey(candidateUserMessage);
          console.log('[Regenerate] Found user message via answer reply:', userMessageId);
        }
      }
    }

    if (!userMessageId) {
      const latestUserMessage = messages.find(msg => msg.role === 'user');
      if (latestUserMessage) {
        userMessageId = getMessageUniqueKey(latestUserMessage);
        console.log('[Regenerate] Fallback to latest user message:', userMessageId);
      }
    }

    if (!userMessageId) {
      reporter.error({
        message: 'regenerate_message_error',
        error: new Error('userMessageId_not_found'),
        meta: {
          groupId,
          memberSet: JSON.stringify(memberSet),
        },
      });
      console.error('[Regenerate] Failed to find userMessageId for group:', groupId);
      throw new Error('regenerate message failed to get userMessageId');
    }
  }

  const userMessage =
    findMessageById(messages, userMessageId) ||
    messages.find(msg => msg.role === 'user' && msg.reply_id === groupId);

  if (!userMessage) {
    throw new Error('regenerate message error: failed to get userMessage');
  }

  deleteMessageByIdList(functionCallMessageIdList);
  deleteMessageByIdList(llmAnswerMessageIdList);
  deleteMessageByIdList(followUpMessageIdList);
  clearSuggestions();

  const toRegenerateMessage = getRegenerateMessage({ userMessage, reporter });
  try {
    chatActionLockService.answerAction.lock(groupId, 'regenerate');
    chatActionLockService.globalAction.lock('sendMessageToACK', {
      messageUniqKey: getMessageUniqueKey(toRegenerateMessage),
    });

    await sendMessage(
      {
        message: toRegenerateMessage,
        options: { isRegenMessage: true },
      },
      'regenerate',
    );
  } finally {
    chatActionLockService.answerAction.unlock(groupId, 'regenerate');
    chatActionLockService.globalAction.unlock('sendMessageToACK');
  }
};
