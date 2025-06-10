import { useEffect } from 'react';

import { userStoreService } from '@coze-studio/user-store';
import { useBotListFilterStore } from '@coze-agent-ide/space-bot/store';
import { useSpaceStore } from '@coze-arch/bot-studio-store';

export const useResetStoreOnLogout = () => {
  const isSettled = userStoreService.useIsSettled();
  const isLogined = userStoreService.useIsLogined();
  useEffect(() => {
    if (isSettled && !isLogined) {
      useSpaceStore.getState().reset();
      useBotListFilterStore.getState().reset();
    }
  }, [isLogined, isSettled]);
};
