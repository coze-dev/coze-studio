import { useEffect } from 'react';

import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import {
  createChatBackgroundPlugin,
  chatBackgroundEvent,
  ChatBackgroundEventName,
} from '@coze-common/chat-area-plugin-chat-background';

// 处理聊天背景图在BotEditor与插件的通信
export const useBotEditorChatBackground = () => {
  const backgroundInfo = useBotSkillStore(
    state => state.backgroundImageInfoList?.[0],
  );
  const { ChatBackgroundPlugin } = createChatBackgroundPlugin();

  useEffect(() => {
    // 监听用户设置背景图，将更新的背景图信息传入插件
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
