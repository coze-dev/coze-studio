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

import { SpaceRoleType, SpaceType } from '@coze-arch/idl/developer_api';

import { ProjectRoleType, EProjectPermission } from './constants';

const projectRolePermissionMapOfTeamSpace = {
  [ProjectRoleType.Owner]: [
    EProjectPermission.View,
    EProjectPermission.EDIT_INFO,
    EProjectPermission.DELETE,
    EProjectPermission.PUBLISH,
    EProjectPermission.CREATE_RESOURCE,
    EProjectPermission.COPY_RESOURCE,
    EProjectPermission.COPY,
    EProjectPermission.TEST_RUN_PLUGIN,
    EProjectPermission.TEST_RUN_WORKFLOW,
    EProjectPermission.ADD_COLLABORATOR,
    EProjectPermission.DELETE_COLLABORATOR,
    EProjectPermission.ROLLBACK,
  ],
  [ProjectRoleType.Editor]: [
    EProjectPermission.View,
    EProjectPermission.EDIT_INFO,
    EProjectPermission.CREATE_RESOURCE,
    EProjectPermission.COPY_RESOURCE,
    EProjectPermission.COPY,
    EProjectPermission.TEST_RUN_PLUGIN,
    EProjectPermission.TEST_RUN_WORKFLOW,
    EProjectPermission.ADD_COLLABORATOR,
  ],
};

const spaceRolePermissionMapOfTeamSpace = {
  [SpaceRoleType.Member]: [
    EProjectPermission.View,
    EProjectPermission.COPY,
    EProjectPermission.TEST_RUN_WORKFLOW,
  ],
  [SpaceRoleType.Owner]: [
    EProjectPermission.View,
    EProjectPermission.COPY,
    EProjectPermission.TEST_RUN_WORKFLOW,
  ],
  [SpaceRoleType.Admin]: [
    EProjectPermission.View,
    EProjectPermission.COPY,
    EProjectPermission.TEST_RUN_WORKFLOW,
  ],
  [SpaceRoleType.Default]: [] as EProjectPermission[],
};

const personalSpacePermission = [
  EProjectPermission.View,
  EProjectPermission.EDIT_INFO,
  EProjectPermission.PUBLISH,
  EProjectPermission.DELETE,
  EProjectPermission.CREATE_RESOURCE,
  EProjectPermission.COPY_RESOURCE,
  EProjectPermission.COPY,
  EProjectPermission.TEST_RUN_PLUGIN,
  EProjectPermission.TEST_RUN_WORKFLOW,
  EProjectPermission.ROLLBACK,
];

export function calcPermission(
  key: EProjectPermission,
  {
    projectRoles,
    spaceRoles,
    spaceType,
  }: {
    projectRoles: ProjectRoleType[];
    spaceRoles: SpaceRoleType[];
    spaceType: SpaceType;
  },
) {
  if (spaceType === SpaceType.Personal) {
    return personalSpacePermission.includes(key);
  } else {
    for (const projectRole of projectRoles) {
      if (projectRolePermissionMapOfTeamSpace[projectRole]?.includes(key)) {
        return true;
      }
    }

    for (const spaceRole of spaceRoles) {
      if (spaceRolePermissionMapOfTeamSpace[spaceRole]?.includes(key)) {
        return true;
      }
    }

    return false;
  }
}
