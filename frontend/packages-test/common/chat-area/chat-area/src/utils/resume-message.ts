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
