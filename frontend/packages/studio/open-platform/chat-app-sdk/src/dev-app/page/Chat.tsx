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

import { type FC } from 'react';

import { nanoid } from 'nanoid';
import { OpenApiSource } from '@coze-studio/open-chat/types';
import { WebSdkChat } from '@coze-studio/open-chat';

const uid = nanoid();

const botConfig = {
  user: uid,
  conversation_id: uid,
  bot_id: process.env.CHAT_APP_INDEX_COZE_BOT_ID || '',
  source: OpenApiSource.WebSdk,
};

const TestChatDemo: FC = () => (
  <WebSdkChat
    title="客服小助手"
    chatConfig={botConfig}
    className="absolute top-[50px]"
    useInIframe={false}
    style={{
      position: 'absolute',
      left: 50,
      top: 50,
      width: 460,
      height: 700,
    }}
  />
);

export default TestChatDemo;
