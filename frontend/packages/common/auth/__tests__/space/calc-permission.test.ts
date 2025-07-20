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
      // Owner 应该有更新空间的权限
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Owner]),
      ).toBe(true);

      // Owner 应该有删除空间的权限
      expect(
        calcPermission(ESpacePermisson.DeleteSpace, [SpaceRoleType.Owner]),
      ).toBe(true);

      // Owner 应该有添加成员的权限
      expect(
        calcPermission(ESpacePermisson.AddBotSpaceMember, [
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);

      // Owner 应该有移除成员的权限
      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);

      // Owner 应该有转移所有权的权限
      expect(
        calcPermission(ESpacePermisson.TransferSpace, [SpaceRoleType.Owner]),
      ).toBe(true);

      // Owner 应该有更新成员的权限
      expect(
        calcPermission(ESpacePermisson.UpdateSpaceMember, [
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);

      // Owner 应该有管理 API 的权限
      expect(calcPermission(ESpacePermisson.API, [SpaceRoleType.Owner])).toBe(
        true,
      );
    });

    it('应该为 Admin 角色返回正确的权限', () => {
      // Admin 应该有添加成员的权限
      expect(
        calcPermission(ESpacePermisson.AddBotSpaceMember, [
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      // Admin 应该有移除成员的权限
      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      // Admin 应该有退出空间的权限
      expect(
        calcPermission(ESpacePermisson.ExitSpace, [SpaceRoleType.Admin]),
      ).toBe(true);

      // Admin 应该有更新成员的权限
      expect(
        calcPermission(ESpacePermisson.UpdateSpaceMember, [
          SpaceRoleType.Admin,
        ]),
      ).toBe(true);

      // Admin 不应该有更新空间的权限
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Admin]),
      ).toBe(false);

      // Admin 不应该有删除空间的权限
      expect(
        calcPermission(ESpacePermisson.DeleteSpace, [SpaceRoleType.Admin]),
      ).toBe(false);

      // Admin 不应该有转移所有权的权限
      expect(
        calcPermission(ESpacePermisson.TransferSpace, [SpaceRoleType.Admin]),
      ).toBe(false);

      // Admin 不应该有管理 API 的权限
      expect(calcPermission(ESpacePermisson.API, [SpaceRoleType.Admin])).toBe(
        false,
      );
    });

    it('应该为 Member 角色返回正确的权限', () => {
      // Member 应该有退出空间的权限
      expect(
        calcPermission(ESpacePermisson.ExitSpace, [SpaceRoleType.Member]),
      ).toBe(true);

      // Member 不应该有更新空间的权限
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [SpaceRoleType.Member]),
      ).toBe(false);

      // Member 不应该有删除空间的权限
      expect(
        calcPermission(ESpacePermisson.DeleteSpace, [SpaceRoleType.Member]),
      ).toBe(false);

      // Member 不应该有添加成员的权限
      expect(
        calcPermission(ESpacePermisson.AddBotSpaceMember, [
          SpaceRoleType.Member,
        ]),
      ).toBe(false);

      // Member 不应该有移除成员的权限
      expect(
        calcPermission(ESpacePermisson.RemoveSpaceMember, [
          SpaceRoleType.Member,
        ]),
      ).toBe(false);

      // Member 不应该有转移所有权的权限
      expect(
        calcPermission(ESpacePermisson.TransferSpace, [SpaceRoleType.Member]),
      ).toBe(false);

      // Member 不应该有更新成员的权限
      expect(
        calcPermission(ESpacePermisson.UpdateSpaceMember, [
          SpaceRoleType.Member,
        ]),
      ).toBe(false);

      // Member 不应该有管理 API 的权限
      expect(calcPermission(ESpacePermisson.API, [SpaceRoleType.Member])).toBe(
        false,
      );
    });

    it('应该为 Default 角色返回正确的权限', () => {
      // Default 不应该有任何权限
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
      // 当用户同时拥有 Member 和 Admin 角色时，应该有两个角色的所有权限
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

      // 即使其中一个角色没有权限，只要有一个角色有权限，就应该返回 true
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [
          SpaceRoleType.Member,
          SpaceRoleType.Owner,
        ]),
      ).toBe(true);
    });

    it('应该处理空角色数组', () => {
      // 当没有角色时，应该返回 false
      expect(calcPermission(ESpacePermisson.UpdateSpace, [])).toBe(false);
      expect(calcPermission(ESpacePermisson.ExitSpace, [])).toBe(false);
    });

    it('应该处理未知角色', () => {
      // 当角色未知时，应该返回 false
      expect(
        calcPermission(ESpacePermisson.UpdateSpace, [
          'UnknownRole' as unknown as SpaceRoleType,
        ]),
      ).toBe(false);
    });
  });
});
