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

import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import {
  isAnswerFinishVerboseMessage,
  isFakeInterruptVerboseMessage,
} from '../../utils/verbose';
import { findMessageById, getIsPureAnswerMessage } from '../../utils/message';
import { type Message, type MessageGroup } from '../../store/types';
import { type MessagesStore } from '../../store/messages';

export const getPureAnswerMessagesByGroup = (
  useMessagesStore: MessagesStore,
  groupId?: string,
) => {
  const { messages, messageGroupList } = useMessagesStore.getState();
  const targetGroup = messageGroupList.find(g => g.groupId === groupId);
  if (!targetGroup) {
    return null;
  }
  return targetGroup.memberSet.llmAnswerMessageIdList
    .map(id => findMessageById(messages, id))
    .filter((msg): msg is Message => !!msg)
    .filter(getIsPureAnswerMessage);
};

export const getLastPureAnswerMessage = (
  useMessagesStore: MessagesStore,
  groupId?: string,
) => {
  const messages = getPureAnswerMessagesByGroup(useMessagesStore, groupId);
  if (!messages) {
    return null;
  }
  return messages.at(0) || null;
};

export const useIsGroupAnswerFinish = ({ memberSet }: MessageGroup) => {
  const { useMessagesStore } = useChatAreaStoreSet();

  return useMessagesStore(state => {
    const functionCallMessages = memberSet.functionCallMessageIdList.map(id =>
      state.findMessage(id),
    );
    const hasFinalAnswer = functionCallMessages.some(
      message => message && isAnswerFinishVerboseMessage(message),
    );
    return Boolean(hasFinalAnswer);
  });
};

// Message of non-real operation abort
export const useIsGroupFakeInterruptAnswer = ({ memberSet }: MessageGroup) => {
  const { useMessagesStore } = useChatAreaStoreSet();

  return useMessagesStore(state => {
    const functionCallMessages = memberSet.functionCallMessageIdList.map(id =>
      state.findMessage(id),
    );

    const hasFakeInterruptMessage = functionCallMessages.some(
      message => message && isFakeInterruptVerboseMessage(message),
    );
    return Boolean(hasFakeInterruptMessage);
  });
};
