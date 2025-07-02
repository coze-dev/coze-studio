import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { getIsAnswerActionLockMap } from '../../service/chat-action-lock/helper/action-lock-map';

export const useIsDeleteMessageLock = (groupId: string) => {
  const { useChatActionStore } = useChatAreaStoreSet();
  const isSendMessageLock = useChatActionStore(state =>
    getIsAnswerActionLockMap.deleteMessageGroup(
      groupId,
      state.answerActionLockMap,
      state.globalActionLock,
    ),
  );
  return isSendMessageLock;
};
