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

import { type MixMessageContent } from '@coze-common/chat-core/message/types';
import {
  useMessageBoxContext,
  getIsTextMessage,
  ContentType,
} from '@coze-common/chat-area';

import { catchParse } from '@/util';

export const useMessageHoverInfo = () => {
  const { meta, message } = useMessageBoxContext();
  const isNeedHoverAnswer =
    message.type === 'answer' &&
    (!meta.isFromLatestGroup || !meta.isGroupLastAnswerMessage);

  let showHoverText: string | undefined;
  let isMultiMessage = false;
  if (message.type === 'question' || message.type === 'ack') {
    // question 会存在mix的数据结构，需获取text的值
    if (getIsTextMessage(message)) {
      showHoverText = message.content;
    } else if (message?.content_type === ContentType.Mix) {
      const contentObj = catchParse<MixMessageContent>(message.content);
      showHoverText = contentObj?.item_list
        .map(item => (item.type === 'text' && item.text) || '')
        .filter(item => !!item)
        .join('\n');

      isMultiMessage = (contentObj?.item_list?.length || 0) > 1;
    }
  } else if (isNeedHoverAnswer) {
    if (getIsTextMessage(message)) {
      showHoverText = message.content;
    }
  }
  return {
    showHoverText,
    isMultiMessage,
  };
};
