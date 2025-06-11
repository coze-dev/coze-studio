import { useSpace } from '@coze-arch/foundation-sdk';

import { useSpaceRole } from '../space/use-space-role';
import { useProjectRole } from './use-project-role';
import { type EProjectPermission } from './constants';
import { calcPermission } from './calc-permission';

export function useProjectAuth(
  key: EProjectPermission,
  projectId: string,
  spaceId: string,
) {
  // 获取space类型信息
  const space = useSpace(spaceId);

  if (!space?.space_type) {
    throw new Error(
      'useSpaceAuth must be used after space list has been pulled.',
    );
  }

  // 获取space role信息
  const spaceRoles = useSpaceRole(spaceId);

  // 获取project role信息
  const projectRoles = useProjectRole(projectId);

  // 计算权限点
  return calcPermission(key, {
    projectRoles,
    spaceRoles,
    spaceType: space.space_type,
  });
}
