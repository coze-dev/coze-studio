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

import { useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isEqual } from 'lodash-es';
import { useChatAreaStoreSet } from '@coze-common/chat-area';

import { useChatAppStore } from '../store';

export const useUpdateConversationNameByMessage = () => {
  const currentConversationNameRef = useRef<string>();
  const { updateCurrentConversationNameByMessage, currentConversationInfo } =
    useChatAppStore(
      useShallow(s => ({
        updateCurrentConversationNameByMessage:
          s.updateCurrentConversationNameByMessage,
        currentConversationInfo: s.currentConversationInfo,
      })),
    );

  const { useMessagesStore } = useChatAreaStoreSet();

  const messages = useMessagesStore(s => s.messages, isEqual);

  useEffect(() => {
    currentConversationNameRef.current = currentConversationInfo?.name;
  }, [currentConversationInfo]);

  useEffect(() => {
    const message = messages[messages.length - 1];
    const name = message?.content.slice(0, 100);
    if (message && !currentConversationNameRef.current) {
      updateCurrentConversationNameByMessage(name);
      currentConversationNameRef.current = name;
    }
  }, [messages]);
};
