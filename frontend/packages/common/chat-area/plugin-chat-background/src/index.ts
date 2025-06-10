import mitt from 'mitt';
import { type PluginRegistryEntry } from '@coze-common/chat-area';

import {
  type BackgroundPluginBizContext,
  type ChatBackgroundEvent,
} from './types/biz-context';
import { createBackgroundImageStore } from './store';
import { BizPlugin } from './plugin';

export const chatBackgroundEvent = mitt<ChatBackgroundEvent>();
export {
  ChatBackgroundEvent,
  ChatBackgroundEventName,
} from './types/biz-context';

export const createChatBackgroundPlugin = () => {
  const useChatBackgroundContext = createBackgroundImageStore('chatBackground');

  // eslint-disable-next-line @typescript-eslint/naming-convention -- 插件命名大写开头符合预期
  const ChatBackgroundPlugin: PluginRegistryEntry<BackgroundPluginBizContext> =
    {
      createPluginBizContext() {
        return {
          storeSet: {
            useChatBackgroundContext,
          },
          chatBackgroundEvent,
        };
      },
      Plugin: BizPlugin,
    };
  return {
    ChatBackgroundPlugin,
  };
};
