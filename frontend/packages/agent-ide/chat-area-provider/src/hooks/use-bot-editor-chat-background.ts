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

import { useEffect } from 'react';

import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import {
  createChatBackgroundPlugin,
  chatBackgroundEvent,
  ChatBackgroundEventName,
} from '@coze-common/chat-area-plugin-chat-background';

// Handling chat background covers communication with plugins in BotEditor
export const useBotEditorChatBackground = () => {
  const backgroundInfo = useBotSkillStore(
    state => state.backgroundImageInfoList?.[0],
  );
  const { ChatBackgroundPlugin } = createChatBackgroundPlugin();

  useEffect(() => {
    // Monitor the user to set the background cover and pass the updated background cover information to the plugin
    chatBackgroundEvent.emit(
      ChatBackgroundEventName.OnBackgroundChange,
      backgroundInfo,
    );
  }, [backgroundInfo]);

  return {
    ChatBackgroundPlugin,
    showBackground: !!backgroundInfo?.mobile_background_image?.origin_image_url,
  };
};
