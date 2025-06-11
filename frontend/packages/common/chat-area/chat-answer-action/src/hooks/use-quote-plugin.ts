import { type GrabPluginBizContext } from '@coze-common/chat-area-plugin-message-grab';
import { PluginName, useWriteablePlugin } from '@coze-common/chat-area';

export const useQuotePlugin = () => {
  try {
    const plugin = useWriteablePlugin<GrabPluginBizContext>(
      PluginName.MessageGrab,
    );

    return plugin;
  } catch (e) {
    return null;
  }
};
