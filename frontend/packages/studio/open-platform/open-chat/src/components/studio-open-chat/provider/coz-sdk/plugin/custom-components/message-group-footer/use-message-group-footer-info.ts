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

import { useMemo } from 'react';

import {
  type MessageGroup,
  useChatAreaStoreSet,
} from '@coze-common/chat-area';

import { useChatAppStore } from '@/components/studio-open-chat/store';
export const useMessageGroupFooterInfo = (messageGroup: MessageGroup) => {
  const feedbackInfo = useChatAppStore(s => s.feedbackInfo);
  const { useMessagesStore } = useChatAreaStoreSet();
  const { findMessage } = useMessagesStore.getState();

  const lastGroupFeedbackInfo = useChatAppStore(s => s.lastGroupFeedbackInfo);
  const { messageId } = lastGroupFeedbackInfo;
  const messageInfo = findMessage(messageId || '');
  // @ts-expect-error -- linter-disable-autofix, 新添加参数，接口未支持
  const cozeApiMessageId = messageInfo?.extra_info?.coze_api_message_id;

  const isShowFeedbackInLastGroup = useMemo(() => {
    if (
      lastGroupFeedbackInfo.isShowCustomPanel &&
      messageId &&
      feedbackInfo[cozeApiMessageId] === 'thumbDown'
    ) {
      // 当前message已经是点踩了，同时需要展示自定义面板

      return messageGroup.memberSet.llmAnswerMessageIdList.includes(messageId);
    }
    return false;
  }, [feedbackInfo, lastGroupFeedbackInfo, messageGroup]);
  return { isShowFeedbackInLastGroup, cozeApiMessageId };
};
