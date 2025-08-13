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

import { useMemo } from 'react';

import { isEqual } from 'lodash-es';
import {
  useMessageBoxContext,
  useChatAreaStoreSet,
  getIsTextMessage,
} from '@coze-common/chat-area';

export const useMessageFooterInfo = () => {
  const { groupId } = useMessageBoxContext();
  const { useMessagesStore } = useChatAreaStoreSet();

  const messageGroupList = useMessagesStore(s => s.messageGroupList, isEqual);
  const messages = useMessagesStore(s => s.messages, isEqual);
  const findMessage = useMessagesStore(s => s.findMessage, isEqual);

  const lastMessageText = useMemo(() => {
    const messageGroup = messageGroupList.find(
      group => group.groupId === groupId,
    );
    return messageGroup?.memberSet.llmAnswerMessageIdList
      .map(item => {
        const messageItem = findMessage(item);
        if (getIsTextMessage(messageItem)) {
          return messageItem.content;
        }
        return '';
      })
      .filter(item => !!item)
      .reverse()
      .join('\n');
  }, [messageGroupList, messages, findMessage, groupId]);
  return {
    lastMessageText,
  };
};
