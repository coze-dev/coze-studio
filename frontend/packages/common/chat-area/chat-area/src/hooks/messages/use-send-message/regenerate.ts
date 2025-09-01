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

import { useShallow } from 'zustand/react/shallow';
import { ContentType } from '@coze-common/chat-core';

import { useCouldSendNewMessage } from '../use-stop-responding';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../../context/use-chat-area-context';
import { regenerateMessage as originRegenerateMessage } from '../../../utils/message-group/regenerate-message';
import type { Message, MessageGroup } from '../../../store/types';
import { useChatActionLockService } from '../../../context/chat-action-lock';
import { useSendTextMessage } from './text-message';
import { useSendMessageAndAutoUpdate } from './new-message';
import { useSendFileMessage, useSendImageMessage } from './file-message';
import { fixUserMessageIdInGroup } from '../../../utils/message-group/fix-user-message-id';

export const useResendMessage = () => {
  const sendTextMessage = useSendTextMessage();

  const { useFileStore, useMessagesStore } = useChatAreaStoreSet();

  const sendFileMessage = useSendFileMessage();
  const sendImageMessage = useSendImageMessage();

  const temporaryFile = useFileStore(useShallow(state => state.temporaryFile));

  const couldSendMessage = useCouldSendNewMessage();

  return (message: Message) => {
    const { deleteMessageByIdStruct } = useMessagesStore.getState();
    if (!couldSendMessage) {
      return;
    }

    deleteMessageByIdStruct(message);

    if (message.content_type === ContentType.Text) {
      sendTextMessage(
        {
          text: message.content,
          mentionList: message.mention_list,
        },
        'other',
      );
    }

    if ([ContentType.File, ContentType.Image].includes(message.content_type)) {
      const isFile = message.content_type === ContentType.File;

      const {
        extra_info: { local_message_id },
      } = message;

      const file = temporaryFile[local_message_id];
      if (file) {
        if (isFile) {
          sendFileMessage(file, 'other');
        } else {
          sendImageMessage(file, 'other');
        }
      }
    }
  };
};

export const useRegenerateMessage = () => {
  const sendMessage = useSendMessageAndAutoUpdate();

  const { reporter } = useChatAreaContext();
  const storeSet = useChatAreaStoreSet();

  const chatActionLockService = useChatActionLockService();

  return async (messageGroup: MessageGroup) => {
    // 修复可能缺失的 userMessageId
    const { messages } = storeSet.useMessagesStore.getState();
    const fixedMessageGroup = fixUserMessageIdInGroup(messageGroup, messages);
    
    return originRegenerateMessage({
      messageGroup: fixedMessageGroup,
      context: {
        storeSet,
        sendMessage,
        chatActionLockService,
        reporter,
      },
    });
  };
};

/**
 * Resend messages according to message_id
 */
export const useRegenerateMessageByUserMessageId = () => {
  const regenerateMessage = useRegenerateMessage();

  const { useMessagesStore } = useChatAreaStoreSet();

  return async (messageId: string) => {
    const { messageGroupList, messages } = useMessagesStore.getState();
    let messageGroup = messageGroupList.find(
      ({ memberSet }) => memberSet.userMessageId === messageId,
    );
    
    // 如果通过 userMessageId 找不到，尝试通过其他方式查找
    if (!messageGroup) {
      // 尝试通过 groupId 查找
      messageGroup = messageGroupList.find(
        ({ groupId }) => groupId === messageId
      );
      
      // 如果找到了但 userMessageId 缺失，修复它
      if (messageGroup) {
        messageGroup = fixUserMessageIdInGroup(messageGroup, messages);
      }
    }
    
    if (!messageGroup) {
      throw new Error('regenerate message error: failed to get message');
    }
    await regenerateMessage(messageGroup);
  };
};
