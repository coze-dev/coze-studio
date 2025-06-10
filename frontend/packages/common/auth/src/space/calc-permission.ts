import { SpaceRoleType } from '@coze-arch/idl/developer_api';

import { ESpacePermisson } from './constants';

const permissionMap = {
  [SpaceRoleType.Owner]: [
    ESpacePermisson.UpdateSpace,
    ESpacePermisson.DeleteSpace,
    ESpacePermisson.AddBotSpaceMember,
    ESpacePermisson.RemoveSpaceMember,
    ESpacePermisson.TransferSpace,
    ESpacePermisson.UpdateSpaceMember,
    ESpacePermisson.API,
  ],
  [SpaceRoleType.Admin]: [
    ESpacePermisson.AddBotSpaceMember,
    ESpacePermisson.RemoveSpaceMember,
    ESpacePermisson.ExitSpace,
    ESpacePermisson.UpdateSpaceMember,
  ],
  [SpaceRoleType.Member]: [ESpacePermisson.ExitSpace],
  // [SpaceRoleType.Default]: [],
};

export const calcPermission = (
  key: ESpacePermisson,
  roles: SpaceRoleType[],
) => {
  for (const role of roles) {
    if (permissionMap[role]?.includes(key)) {
      return true;
    }
  }
  return false;
};
