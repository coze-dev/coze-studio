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

import { nanoid } from 'nanoid';
import { pick } from 'lodash-es';
import { ChatType } from '@coze-studio/open-chat/types';
import { OpenApiSource, type IframeParams } from '@coze-studio/open-chat/types';

import { type CozeChatOptions } from '@/types/client';

export const getChatConfig = (
  chatClientId: string,
  cozeChatOption: CozeChatOptions,
): IframeParams => {
  const { config, auth, userInfo, ui, extra } = cozeChatOption;
  return {
    chatClientId,
    chatConfig: {
      type: config?.type || ChatType.BOT,
      bot_id: (config?.botId ?? config?.bot_id) || '',
      appInfo: config?.appInfo,
      botInfo: config?.botInfo,
      conversation_id: nanoid(),
      extra,
      ui: {
        base: pick(ui?.base || {}, ['icon', 'lang', 'layout']),
        chatBot: pick(ui?.chatBot || {}, [
          'title',
          'uploadable',
          'isNeedClearContext',
          'isNeedClearMessage',
          'isNeedAudio',
          'isNeedFunctionCallMessage',
          'isNeedQuote',
          'isNeedAddNewConversation',
          'feedback',
        ]),
        footer: ui?.footer,
        header: ui?.header,
        conversations: ui?.conversations,
      },
      auth: pick(auth || {}, ['type', 'token']),
      source: OpenApiSource.WebSdk,
    },
    userInfo,
  };
};
