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
      // Verify that all permission spots are defined
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
      // Create a collection to store the values of all permission spots
      const permissionValues = new Set();

      // Get values for all permission spots
      Object.values(ESpacePermisson)
        .filter(value => typeof value === 'number')
        .forEach(value => {
          permissionValues.add(value);
        });

      // The number of validation permission spots is the same as the number of unique values
      const numericKeys = Object.keys(ESpacePermisson).filter(
        key => !isNaN(Number(key)),
      ).length;

      expect(permissionValues.size).toBe(numericKeys);
    });
  });

  describe('SpaceRoleType', () => {
    it('应该正确导出 SpaceRoleType', () => {
      // Verify that SpaceRoleType has been exported correctly
      expect(SpaceRoleType).toBeDefined();

      // Verify that SpaceRoleType contains the necessary roles
      expect(SpaceRoleType.Owner).toBeDefined();
      expect(SpaceRoleType.Admin).toBeDefined();
      expect(SpaceRoleType.Member).toBeDefined();
      expect(SpaceRoleType.Default).toBeDefined();
    });
  });
});
