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
