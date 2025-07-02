import { useCreation } from 'ahooks';
import { type Reporter } from '@coze-arch/logger';

import { ChatActionLockService } from '../../../service/chat-action-lock';
import { type StoreSet } from '../../../context/chat-area-context/type';

export const useInitChatActionLockService = ({
  storeSet: { useChatActionStore },
  enableChatActionLock,
  reporter,
}: {
  storeSet: Pick<StoreSet, 'useChatActionStore'>;
  enableChatActionLock: boolean | undefined;
  reporter: Reporter;
}): ChatActionLockService =>
  useCreation(() => {
    const {
      getAnswerActionLockMap,
      getGlobalActionLock,
      updateGlobalActionLockByImmer,
      updateAnswerActionLockMapByImmer,
    } = useChatActionStore.getState();

    const chatActionLockService = new ChatActionLockService({
      updateGlobalActionLockByImmer,
      getGlobalActionLock,
      updateAnswerActionLockMapByImmer,
      getAnswerActionLockMap,
      readEnvValues: () => ({
        enableChatActionLock: enableChatActionLock ?? false,
      }),
      reporter,
    });

    return chatActionLockService;
  }, []);
