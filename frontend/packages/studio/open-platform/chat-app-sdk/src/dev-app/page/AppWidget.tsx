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

import { type FC, useState } from 'react';

import { nanoid } from 'nanoid';
import { OpenApiSource } from '@coze-studio/open-chat/types';
import { WebSdkChat } from '@coze-studio/open-chat';

const uid = nanoid();

const botConfig = {
  bot_id: process.env.CHAT_APP_INDEX_COZE_BOT_ID || '',
  user: uid,
  conversation_id: uid,
  source: OpenApiSource.WebSdk,
};

const TestAppWidget: FC = () => {
  const [visible] = useState(false);
  // 触发更新
  return (
    <>
      {visible ? (
        <WebSdkChat
          title="客服小助手"
          chatConfig={botConfig}
          style={{ height: 800 }}
          useInIframe={false}
        />
      ) : null}
    </>
  );
};

export default TestAppWidget;
