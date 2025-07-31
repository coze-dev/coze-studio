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
       * The last suggestion returned during the conversation will appear in the first item in the chat history
       * During conversation take push suggestion here handle chat history need to take unshift
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
