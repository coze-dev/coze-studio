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
  // Get space type information
  const space = useSpace(spaceId);

  if (!space?.space_type) {
    throw new Error(
      'useSpaceAuth must be used after space list has been pulled.',
    );
  }

  // Get space role information
  const spaceRoles = useSpaceRole(spaceId);

  // Get project role information
  const projectRoles = useProjectRole(projectId);

  // Calculate permission spot
  return calcPermission(key, {
    projectRoles,
    spaceRoles,
    spaceType: space.space_type,
  });
}
