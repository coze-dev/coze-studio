import { useEffect } from 'react';

import { type StoreSet } from '../../context/chat-area-context/type';

/**
 * 销毁时额外清除一下 setScrollViewFarFromBottom，主要针对 coze home 场景
 */
export const useResetToNewestTip = (storeSet: StoreSet) => {
  useEffect(
    () => () => {
      storeSet.useMessageIndexStore
        .getState()
        .setScrollViewFarFromBottom(false);
    },
    [],
  );
};
