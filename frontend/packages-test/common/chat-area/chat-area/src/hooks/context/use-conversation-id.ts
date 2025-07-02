import { isValidContext } from '../../utils/is-valid-context';
import { useChatAreaStoreSet } from './use-chat-area-context';

export const useConversationId = () => {
  const chatAreaStoreSetContext = useChatAreaStoreSet();
  if (!isValidContext(chatAreaStoreSetContext)) {
    throw new Error('chatAreaStoreSetContext is not valid');
  }
  const { useGlobalInitStore } = chatAreaStoreSetContext;
  const conversationId = useGlobalInitStore(state => state.conversationId);

  return conversationId;
};
