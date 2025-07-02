import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useHasMessageList = () => {
  const { useMessagesStore } = useChatAreaStoreSet();
  const hasMessageList = useMessagesStore(state =>
    Boolean(state.messages.length),
  );
  return hasMessageList;
};
