import { useEffect } from 'react';

import { useSpaceAuthStore } from './store';

export function useDestorySpace(spaceId: string) {
  const destorySpace = useSpaceAuthStore(store => store.destory);

  return useEffect(
    () => () => {
      // 空间组件销毁时，清空对应space数据
      destorySpace(spaceId);
    },
    [],
  );
}
