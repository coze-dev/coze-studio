import { Scene } from '@coze-common/chat-core';
import type ChatCore from '@coze-common/chat-core';

import { type ChatAreaProviderProps } from '../type';

export const generateChatCoreBiz = (
  params: ChatAreaProviderProps['scene'],
): ChatCore['biz'] => {
  switch (params) {
    case Scene.CozeHome:
      return 'coze_home';
    case Scene.Playground:
      return 'bot_editor';
    // 现在没有 bot store 场景
    default:
      return 'third_part';
  }
};
