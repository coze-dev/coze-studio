/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
