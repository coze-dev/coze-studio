import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useProjectAuthStore, ProjectRoleType } from '@coze-common/auth';

export function useInitProjectRole(spaceId: string, projectId: string) {
  const { setIsReady, setRoles, isReady } = useProjectAuthStore(
    useShallow(store => ({
      isReady: store.isReady[projectId],
      setIsReady: store.setIsReady,
      setRoles: store.setRoles,
    })),
  );

  useEffect(() => {
    setRoles(projectId, [ProjectRoleType.Owner]);
    setIsReady(projectId, true);
  }, [projectId]);

  return isReady; // 是否初始化完成。
}
