import { useShallow } from 'zustand/react/shallow';
import { useSpace } from '@coze-arch/foundation-sdk';

import { useSpaceAuthStore } from './store';

export function useSpaceRole(spaceId: string) {
  // 获取space信息，已有hook。
  const space = useSpace(spaceId);

  if (!space) {
    throw new Error(
      'useSpaceAuth must be used after space list has been pulled.',
    );
  }

  const { isReady, role } = useSpaceAuthStore(
    useShallow(store => ({
      isReady: store.isReady[spaceId],
      role: store.roles[spaceId],
    })),
  );

  if (!isReady) {
    throw new Error(
      'useSpaceAuth must be used after useInitSpaceRole has been completed.',
    );
  }

  if (!role) {
    throw new Error(`Can not get space role of space: ${spaceId}`);
  }

  return role;
}
