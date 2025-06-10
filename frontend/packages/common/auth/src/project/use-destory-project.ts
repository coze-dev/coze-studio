import { useEffect } from 'react';

import { useProjectAuthStore } from './store';

export function useDestoryProject(projectId: string) {
  const destorySpace = useProjectAuthStore(store => store.destory);

  return useEffect(
    () => () => {
      // 空间组件销毁时，清空对应space数据
      destorySpace(projectId);
    },
    [],
  );
}
