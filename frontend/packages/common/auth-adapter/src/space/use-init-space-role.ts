/**
 * @file 社区版暂时不提供权限控制功能，本文件中导出的方法用于未来拓展使用。
 */

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { SpaceRoleType } from '@coze-arch/idl/developer_api';
import { useSpaceAuthStore } from '@coze-common/auth';

export function useInitSpaceRole(spaceId: string) {
  const { setIsReady, setRoles, isReady } = useSpaceAuthStore(
    useShallow(store => ({
      setIsReady: store.setIsReady,
      setRoles: store.setRoles,
      isReady: store.isReady[spaceId],
    })),
  );

  useEffect(() => {
    setRoles(spaceId, [SpaceRoleType.Owner]);
    setIsReady(spaceId, true);
  }, [spaceId]);

  return isReady;
}
