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

export const regenerateMessage = async ({
  messageGroup: { memberSet, groupId },
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
  if (chatActionLockService.answerAction.getIsLock(groupId, 'regenerate')) {
    return;
  }
  if (chatActionLockService.globalAction.getIsLock('sendMessageToACK')) {
    return;
  }
  const { useMessagesStore, useSuggestionsStore } = storeSet;
  const { clearSuggestions } = useSuggestionsStore.getState();
  const { deleteMessageByIdList, messages } = useMessagesStore.getState();
  const {
    userMessageId,
    llmAnswerMessageIdList,
    functionCallMessageIdList,
    followUpMessageIdList,
    ...rest
  } = memberSet;
  checkNoneMessageGroupMemberLeft(rest);

  if (!userMessageId) {
    throw new Error('regenerate message failed to get userMessageId');
  }

  const userMessage = findMessageById(messages, userMessageId);

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
