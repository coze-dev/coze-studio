import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { getIsGlobalActionLockMap } from '../../service/chat-action-lock/helper/action-lock-map';

export const useIsSendMessageLock = () => {
  const { useChatActionStore } = useChatAreaStoreSet();
  const isSendMessageLock = useChatActionStore(state =>
    getIsGlobalActionLockMap.sendMessageToACK(state.globalActionLock),
  );
  return isSendMessageLock;
};
