import { useSpaceRole } from './use-space-role';
import { type ESpacePermisson } from './constants';
import { calcPermission } from './calc-permission';

export function useSpaceAuth(key: ESpacePermisson, spaceId: string) {
  // 获取space role信息
  const role = useSpaceRole(spaceId);
  // 计算权限点
  return calcPermission(key, role);
}
