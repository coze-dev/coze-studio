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

import { type PropsWithChildren } from 'react';

import { isEqual } from 'lodash-es';

import { getIsGroupChatActive } from '../../utils/message-group/get-is-group-chat-active';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import {
  type MessageBoxContextProviderProps,
  MessageBoxContext,
} from './context';

export interface MessageBoxProviderProps
  extends Omit<
    MessageBoxContextProviderProps,
    'message' | 'meta' | 'isGroupChatActive'
  > {
  groupId: string;
}

export const MessageBoxProvider: React.FC<
  PropsWithChildren<MessageBoxProviderProps>
> = ({ children, messageUniqKey, groupId, ...props }) => {
  const { useMessagesStore, useMessageMetaStore, useWaitingStore } =
    useChatAreaStoreSet();

  const isGroupChatActive = useWaitingStore(state =>
    getIsGroupChatActive({ ...state, groupId }),
  );
  // Get message by messageId
  const message = useMessagesStore(
    state => state.findMessage(messageUniqKey),
    isEqual,
  );

  // Get message meta by messageId
  const meta = useMessageMetaStore(
    state => state.getMetaByMessage(messageUniqKey),
    isEqual,
  );
  return (
    <MessageBoxContext.Provider
      value={{
        message,
        groupId,
        meta,
        messageUniqKey,
        isGroupChatActive,
        ...props,
      }}
    >
      {children}
    </MessageBoxContext.Provider>
  );
};

MessageBoxProvider.displayName = 'MessageBoxProvider';
