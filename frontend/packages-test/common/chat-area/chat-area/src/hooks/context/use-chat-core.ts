import { useChatAreaStoreSet } from './use-chat-area-context';

export const useChatCore = () => {
  const { useGlobalInitStore } = useChatAreaStoreSet();
  const chatCore = useGlobalInitStore(state => state.getChatCore());
  return chatCore;
};
