import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { getIsGlobalActionLockMap } from '../../service/chat-action-lock/helper/action-lock-map';

export const useIsClearHistoryLock = () => {
  const { useChatActionStore } = useChatAreaStoreSet();
  const isSendMessageLock = useChatActionStore(state =>
    getIsGlobalActionLockMap.clearHistory(state.globalActionLock),
  );
  return isSendMessageLock;
};
