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
 * Send resume message, break chat scene
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

    // Find the message before the interruption
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

    // Continue chatting Open query waiting status
    startWaiting(questionMessage);

    /** If it is a resume message, the local message state is not maintained, only the request is sent */
    chatCore.resumeMessage(questionMessage, mergedOptions);
  };
