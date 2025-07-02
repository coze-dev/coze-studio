import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useIsClearMessageHistoryLock = () => {
  const { useChatActionStore } = useChatAreaStoreSet();
  return useChatActionStore(state =>
    Boolean(state.globalActionLock.clearHistory),
  );
};
