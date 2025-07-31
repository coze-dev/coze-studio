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

import {
  ProjectRoleType,
  EProjectPermission,
} from '../../src/project/constants';

describe('Project Constants', () => {
  describe('ProjectRoleType', () => {
    it('应该定义所有必要的角色类型', () => {
      // Verify that all role types are defined
      expect(ProjectRoleType.Owner).toBeDefined();
      expect(ProjectRoleType.Editor).toBeDefined();

      // Validate the value of the role type
      expect(ProjectRoleType.Owner).toBe('owner');
      expect(ProjectRoleType.Editor).toBe('editor');
    });

    it('应该包含正确数量的角色类型', () => {
      // Number of validation role types
      const roleTypeCount = Object.keys(ProjectRoleType).filter(key =>
        isNaN(Number(key)),
      ).length;

      expect(roleTypeCount).toBe(2); // Owner and Editor
    });
  });

  describe('EProjectPermission', () => {
    it('应该定义所有必要的权限点', () => {
      // Verify that all permission spots are defined
      expect(EProjectPermission.View).toBeDefined();
      expect(EProjectPermission.EDIT_INFO).toBeDefined();
      expect(EProjectPermission.DELETE).toBeDefined();
      expect(EProjectPermission.PUBLISH).toBeDefined();
      expect(EProjectPermission.CREATE_RESOURCE).toBeDefined();
      expect(EProjectPermission.COPY_RESOURCE).toBeDefined();
      expect(EProjectPermission.COPY).toBeDefined();
      expect(EProjectPermission.TEST_RUN_PLUGIN).toBeDefined();
      expect(EProjectPermission.TEST_RUN_WORKFLOW).toBeDefined();
      expect(EProjectPermission.ADD_COLLABORATOR).toBeDefined();
      expect(EProjectPermission.DELETE_COLLABORATOR).toBeDefined();
    });

    it('应该为每个权限点分配唯一的值', () => {
      // Create a collection to store the values of all permission spots
      const permissionValues = new Set();

      // Get values for all permission spots
      Object.values(EProjectPermission)
        .filter(value => typeof value === 'number')
        .forEach(value => {
          permissionValues.add(value);
        });

      // The number of validation permission spots is the same as the number of unique values
      const numericKeys = Object.keys(EProjectPermission).filter(
        key => !isNaN(Number(key)),
      ).length;

      expect(permissionValues.size).toBe(numericKeys);
    });

    it('应该包含正确数量的权限点', () => {
      // Number of permission spots verified
      const permissionCount = Object.keys(EProjectPermission).filter(key =>
        isNaN(Number(key)),
      ).length;

      expect(permissionCount).toBe(12); // 11 permission spots
    });
  });
});
