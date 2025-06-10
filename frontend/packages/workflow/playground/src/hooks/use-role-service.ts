import { useService } from '@flowgram-adapter/free-layout-editor';

import { RoleService, type RoleServiceState } from '@/services/role-service';

export const useRoleService = () => useService<RoleService>(RoleService);

export const useRoleServiceStore = <T>(
  selector: (s: RoleServiceState) => T,
) => {
  const roleService = useRoleService();

  return roleService.store(selector);
};
