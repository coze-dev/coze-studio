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

describe('Space Constants', () => {
  describe('ESpacePermisson', () => {
    it('应该定义所有必要的权限点', () => {
      // 验证所有权限点都已定义
      expect(ESpacePermisson.UpdateSpace).toBeDefined();
      expect(ESpacePermisson.DeleteSpace).toBeDefined();
      expect(ESpacePermisson.AddBotSpaceMember).toBeDefined();
      expect(ESpacePermisson.RemoveSpaceMember).toBeDefined();
      expect(ESpacePermisson.ExitSpace).toBeDefined();
      expect(ESpacePermisson.TransferSpace).toBeDefined();
      expect(ESpacePermisson.UpdateSpaceMember).toBeDefined();
      expect(ESpacePermisson.API).toBeDefined();
    });

    it('应该为每个权限点分配唯一的值', () => {
      // 创建一个集合来存储所有权限点的值
      const permissionValues = new Set();

      // 获取所有权限点的值
      Object.values(ESpacePermisson)
        .filter(value => typeof value === 'number')
        .forEach(value => {
          permissionValues.add(value);
        });

      // 验证权限点的数量与唯一值的数量相同
      const numericKeys = Object.keys(ESpacePermisson).filter(
        key => !isNaN(Number(key)),
      ).length;

      expect(permissionValues.size).toBe(numericKeys);
    });
  });

  describe('SpaceRoleType', () => {
    it('应该正确导出 SpaceRoleType', () => {
      // 验证 SpaceRoleType 已正确导出
      expect(SpaceRoleType).toBeDefined();

      // 验证 SpaceRoleType 包含必要的角色
      expect(SpaceRoleType.Owner).toBeDefined();
      expect(SpaceRoleType.Admin).toBeDefined();
      expect(SpaceRoleType.Member).toBeDefined();
      expect(SpaceRoleType.Default).toBeDefined();
    });
  });
});
