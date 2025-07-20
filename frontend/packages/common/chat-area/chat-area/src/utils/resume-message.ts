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
 
import { type SendMessageOptions } from '@coze-common/chat-core';
import websocketManager from '@coze-common/websocket-manager-adapter';

import { type StoreSet } from '../context/chat-area-context/type';
import { findMessageById } from './message';

/**
 * 发送resume消息，打断续聊场景
 */
export const createAndSendResumeMessage =
  ({
    storeSet,
  }: {
    storeSet: Pick<
      StoreSet,
      'useGlobalInitStore' | 'useMessagesStore' | 'useWaitingStore'
    >;
  }) =>
  ({ replyId, options }: { replyId: string; options?: SendMessageOptions }) => {
    const { useGlobalInitStore, useMessagesStore, useWaitingStore } = storeSet;

    const chatCore = useGlobalInitStore.getState().getChatCore();

    const { messages } = useMessagesStore.getState();
    const { startWaiting } = useWaitingStore.getState();

    // 查找中断之前的提问message
    const questionMessage = findMessageById(messages, replyId);

    const defaultSendMessageOptions = {
      extendFiled: {
        device_id: String(websocketManager.deviceId),
      },
    };

    const mergedOptions = {
      ...defaultSendMessageOptions,
      ...options,
    };

    if (!chatCore || !questionMessage) {
      throw new Error('chatCore is not ready');
    }

    // 续聊开启query waiting状态
    startWaiting(questionMessage);

    /** 若为resume消息，则不维护本地message状态，只发送请求 */
    chatCore.resumeMessage(questionMessage, mergedOptions);
  };
