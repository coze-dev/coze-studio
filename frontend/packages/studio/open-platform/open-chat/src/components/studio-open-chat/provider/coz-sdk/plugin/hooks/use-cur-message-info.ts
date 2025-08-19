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

import { useMessageBoxContext } from '@coze-common/chat-area';

import { useChatAppProps } from '@/components/studio-open-chat/store';

export const useCurMessageInfo = () => {
  const { message } = useMessageBoxContext();
  const { chatConfig } = useChatAppProps();

  // @ts-expect-error -- linter-disable-autofix, 新添加参数，接口未支持
  const cozeApiMessageId = message.extra_info.coze_api_message_id;
  // @ts-expect-error -- linter-disable-autofix, 新添加参数，接口未支持
  const cozeApiChatId = message.extra_info.coze_api_chatId_id;
  return {
    messageId: message.message_id,
    cozeApiMessageId,
    cozeApiChatId,
    isShowDelete: false, // 暂时下掉删除按钮
    isNeedQuote: chatConfig.ui?.chatBot?.isNeedQuote ?? false,
  };
};
