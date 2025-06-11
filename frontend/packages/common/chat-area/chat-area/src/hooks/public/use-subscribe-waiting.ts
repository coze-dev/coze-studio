import { useEffect } from 'react';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { type Waiting } from '../../store/waiting';
import { type Message, type MessageGroup } from '../../store/types';

export type WaitingChangeCallback = (params: {
  prevWaiting: Waiting | null;
  waiting: Waiting | null;
  messageGroupList: MessageGroup[];
  messages: Message[];
}) => void;

export const useSubscribeWaiting = (callback: WaitingChangeCallback) => {
  const { useWaitingStore, useMessagesStore } = useChatAreaStoreSet();

  useEffect(() => {
    const off = useWaitingStore.subscribe(
      state => state.waiting,
      (waiting, prevWaiting) => {
        const { messageGroupList, messages } = useMessagesStore.getState();
        callback({
          prevWaiting,
          waiting,
          messageGroupList,
          messages,
        });
      },
    );

    return off;
  }, []);
};
