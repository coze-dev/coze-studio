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
  // 通过messageId获取message
  const message = useMessagesStore(
    state => state.findMessage(messageUniqKey),
    isEqual,
  );

  // 通过messageId获取message meta
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
