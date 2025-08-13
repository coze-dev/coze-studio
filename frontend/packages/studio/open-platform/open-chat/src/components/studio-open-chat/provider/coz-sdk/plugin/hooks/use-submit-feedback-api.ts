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

import { useChatAreaStoreSet } from '@coze-common/chat-area';

import { type FeedbackTag } from '@/types/client';
import { useChatAppStore } from '@/components/studio-open-chat/store';

import { useChatCozeSdk } from '../../context';
export interface FeedbackSubmitBody {
  feedbackType: 'thumbDown' | 'thumbUp' | 'default';
  feedbackText?: string;
  feedbackTagList?: FeedbackTag[];
}
const paramMap = {
  thumbDown: 'unlike',
  thumbUp: 'like',
  default: 'default',
};
export const useSubmitFeedbackApi = () => {
  const { useGlobalInitStore } = useChatAreaStoreSet();

  const { cozeApiSdk } = useChatCozeSdk();
  const conversationId = useGlobalInitStore(state => state.conversationId);
  const updateFeedbackInfo = useChatAppStore(s => s.updateFeedbackInfo);

  return (cozeApiMessageId: string, body: FeedbackSubmitBody) => {
    updateFeedbackInfo(cozeApiMessageId, body.feedbackType);
    const feedBackType = paramMap[body.feedbackType] || 'default';
    if (feedBackType === 'default') {
      return cozeApiSdk?.makeRequest(
        `/v1/conversations/${conversationId}/messages/${cozeApiMessageId}/feedback`,
        'DELETE',
      );
    } else {
      return cozeApiSdk?.makeRequest(
        `/v1/conversations/${conversationId}/messages/${cozeApiMessageId}/feedback`,
        'POST',
        {
          feedback_type: feedBackType,
          comment: body.feedbackText,
          reason_types: body.feedbackTagList?.map(item => item.label),
        },
      );
    }
  };
};
