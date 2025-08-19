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

import { useChatActionLockService } from '@coze-common/chat-area/context/chat-action-lock';
import { useChatAreaStoreSet } from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { useChatCozeSdk } from '../../context';

export const useDeleteMessage = () => {
  const storeSet = useChatAreaStoreSet();
  const chatActionLockService = useChatActionLockService();
  const { cozeApiSdk } = useChatCozeSdk();

  return async (conversationId: string, messageId: string) => {
    if (!messageId || !conversationId) {
      return;
    }

    const { useMessagesStore, useSuggestionsStore } = storeSet;
    const { findMessage, isLastMessageGroup } = useMessagesStore.getState();
    const { clearSuggestions } = useSuggestionsStore.getState();

    const messageInfo = findMessage(messageId);
    const groupId = messageInfo?.reply_id;
    // @ts-expect-error -- linter-disable-autofix, 新添加参数，接口未支持
    const cozeApiMessageId = messageInfo?.extra_info?.coze_api_message_id;
    if (!messageInfo || !groupId) {
      throw new Error(`message not found, id: ${messageId}`);
    }

    if (
      chatActionLockService.answerAction.getIsLock(
        groupId,
        'deleteMessageGroup',
      )
    ) {
      return;
    }

    chatActionLockService.answerAction.lock(groupId, 'deleteMessageGroup');

    const isLast = isLastMessageGroup(groupId);

    const { deleteMessageById } = useMessagesStore.getState();

    try {
      await cozeApiSdk?.conversations.messages.delete(
        conversationId,
        cozeApiMessageId,
      );
      deleteMessageById(messageId);
      if (isLast) {
        clearSuggestions();
      }
    } catch (e) {
      console.error(e);
      Toast.error(I18n.t('Delete_failed'));
    } finally {
      chatActionLockService.answerAction.unlock(groupId, 'deleteMessageGroup');
    }
  };
};
