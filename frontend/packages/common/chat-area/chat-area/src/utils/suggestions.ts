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
 
import { type Message } from '../store/types';
import { type IdAndSuggestion } from '../store/suggestions';

export const getIsSuggestion = (message: Message) =>
  message.type === 'follow_up';

export const splitMessageAndSuggestions = (messages: Message[]) => {
  const messageList: Message[] = [];
  const idAndSuggestions: IdAndSuggestion[] = [];
  for (const msg of messages) {
    if (getIsSuggestion(msg)) {
      /**
       * 对话过程中最后返回的 suggestion 会出现在历史消息的第一条
       * 对话过程中采取 push suggestion 此处处理历史消息需要采取 unshift
       */

      idAndSuggestions.unshift({
        replyId: msg.reply_id,
        suggestion: msg.content,
      });
    } else {
      messageList.push(msg);
    }
  }
  return {
    messageList,
    idAndSuggestions,
  };
};
