import { type PluginKey } from '@coze-common/chat-core';

import { useChatCore } from '../context/use-chat-core';

export const useGetRegisteredPlugin = () => {
  const chatCore = useChatCore();
  return (key: PluginKey) => chatCore.getRegisteredPlugin(key);
};
