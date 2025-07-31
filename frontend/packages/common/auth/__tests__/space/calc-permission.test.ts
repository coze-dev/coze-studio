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

import { describe, it, expect } from 'vitest';
import { SpaceRoleType } from '@coze-arch/idl/developer_api';

import { ESpacePermisson } from '../../src/space/constants';
import { calcPermission } from '../../src/space/calc-permission';

describe('Space Calc Permission', () => {
  describe('calcPermission', () => {
    it('应该为 Owner 角色返回正确的权限', () => {
      // Owner should have permission to update the space
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Owner]),
      ).toBe(true);

      // Owner should have permission to delete space
      expect(
        calcPermission(ESpacePermisson.DeleteSpace, [SpaceRoleType.Owner]),
      ).toBe(true);

      // Owner should have permission to add members
      expect(
        calcPermission(ESpacePermisson.AddBotSpaceMember, [
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);

      // Owner should have permission to remove members
      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);

      // Owner should have the right to transfer ownership
      expect(
        calcPermission(ESpacePermisson.TransferSpace, [SpaceRoleType.Owner]),
      ).toBe(true);

      // Owner should have permission to update members
      expect(
        calcPermission(ESpacePermisson.UpdateSpaceMember, [
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);

      // Owner should have permission to manage the API
      expect(calcPermission(ESpacePermisson.API, [SpaceRoleType.Owner])).toBe(
        true,
      );
    });

    it('应该为 Admin 角色返回正确的权限', () => {
      // Admin should have permission to add members
      expect(
        calcPermission(ESpacePermisson.AddBotSpaceMember, [
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      // Admin should have permission to remove members
      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      // Admin should have permission to exit the space
      expect(
        calcPermission(ESpacePermisson.ExitSpace, [SpaceRoleType.Admin]),
      ).toBe(true);

      // Admin should have permission to update members
      expect(
        calcPermission(ESpacePermisson.UpdateSpaceMember, [
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      // Admin should not have permission to update the space
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Admin]),
      ).toBe(false);

      // Admin should not have permission to delete space
      expect(
        calcPermission(ESpacePermisson.DeleteSpace, [SpaceRoleType.Admin]),
      ).toBe(false);

      // Admin should not have permission to transfer ownership
      expect(
        calcPermission(ESpacePermisson.TransferSpace, [SpaceRoleType.Admin]),
      ).toBe(false);

      // Admin should not have permission to manage APIs
      expect(calcPermission(ESpacePermisson.API, [SpaceRoleType.Admin])).toBe(
        false,
      );
    });

    it('应该为 Member 角色返回正确的权限', () => {
      // Members should have permission to exit the space
      expect(
        calcPermission(ESpacePermisson.ExitSpace, [SpaceRoleType.Member]),
      ).toBe(true);

      // Members should not have permission to update space
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Member]),
      ).toBe(false);

      // Members should not have permission to delete space
      expect(
        calcPermission(ESpacePermisson.DeleteSpace, [SpaceRoleType.Member]),
      ).toBe(false);

      // Members should not have permission to add members
      expect(
        calcPermission(ESpacePermisson.AddBotSpaceMember, [
          SpaceRoleType.Member,
        ]),
      ).toBe(false);

      // Members should not have permission to remove members
      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Member,
        ]),
      ).toBe(false);

      // Members should not have permission to transfer ownership
      expect(
        calcPermission(ESpacePermisson.TransferSpace, [SpaceRoleType.Member]),
      ).toBe(false);

      // Members should not have permission to update members
      expect(
        calcPermission(ESpacePermisson.UpdateSpaceMember, [
          SpaceRoleType.Member,
        ]),
      ).toBe(false);

      // Members should not have permission to manage APIs
      expect(calcPermission(ESpacePermisson.API, [SpaceRoleType.Member])).toBe(
        false,
      );
    });

    it('应该为 Default 角色返回正确的权限', () => {
      // Default should not have any permissions
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Default]),
      ).toBe(false);
      expect(
        calcPermission(ESpacePermisson.DeleteSpace, [SpaceRoleType.Default]),
      ).toBe(false);
      expect(
        calcPermission(ESpacePermisson.AddBotSpaceMember, [
          SpaceRoleType.Default,
        ]),
      ).toBe(false);
      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Default,
        ]),
      ).toBe(false);
      expect(
        calcPermission(ESpacePermisson.ExitSpace, [SpaceRoleType.Default]),
      ).toBe(false);
      expect(
        calcPermission(ESpacePermisson.TransferSpace, [SpaceRoleType.Default]),
      ).toBe(false);
      expect(
        calcPermission(ESpacePermisson.UpdateSpaceMember, [
          SpaceRoleType.Default,
        ]),
      ).toBe(false);
      expect(calcPermission(ESpacePermisson.API, [SpaceRoleType.Default])).toBe(
        false,
      );
    });

    it('应该处理多个角色的情况', () => {
      // When a user has both the Member and Admin roles, they should have all the permissions of both roles
      expect(
        calcPermission(ESpacePermisson.ExitSpace, [
          SpaceRoleType.Member,
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Member,
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      // Even if one of the roles has no permissions, it should return true as long as one of the roles has permissions.
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [
          SpaceRoleType.Member,
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);
    });

    it('应该处理空角色数组', () => {
      // When there is no role, it should return false.
      expect(calcPermission(ESpacePermisson.UpdateSpace, [])).toBe(false);
      expect(calcPermission(ESpacePermisson.ExitSpace, [])).toBe(false);
    });

    it('应该处理未知角色', () => {
      // When the character is unknown, it should return false.
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [
          'UnknownRole' as unknown as SpaceRoleType,
        ]),
      ).toBe(false);
    });
  });
});
