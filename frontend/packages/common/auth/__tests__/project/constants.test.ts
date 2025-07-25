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
      // 验证所有角色类型都已定义
      expect(ProjectRoleType.Owner).toBeDefined();
      expect(ProjectRoleType.Editor).toBeDefined();

      // 验证角色类型的值
      expect(ProjectRoleType.Owner).toBe('owner');
      expect(ProjectRoleType.Editor).toBe('editor');
    });

    it('应该包含正确数量的角色类型', () => {
      // 验证角色类型的数量
      const roleTypeCount = Object.keys(ProjectRoleType).filter(key =>
        isNaN(Number(key)),
      ).length;

      expect(roleTypeCount).toBe(2); // Owner 和 Editor
    });
  });

  describe('EProjectPermission', () => {
    it('应该定义所有必要的权限点', () => {
      // 验证所有权限点都已定义
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
      // 创建一个集合来存储所有权限点的值
      const permissionValues = new Set();

      // 获取所有权限点的值
      Object.values(EProjectPermission)
        .filter(value => typeof value === 'number')
        .forEach(value => {
          permissionValues.add(value);
        });

      // 验证权限点的数量与唯一值的数量相同
      const numericKeys = Object.keys(EProjectPermission).filter(
        key => !isNaN(Number(key)),
      ).length;

      expect(permissionValues.size).toBe(numericKeys);
    });

    it('应该包含正确数量的权限点', () => {
      // 验证权限点的数量
      const permissionCount = Object.keys(EProjectPermission).filter(key =>
        isNaN(Number(key)),
      ).length;

      expect(permissionCount).toBe(12); // 11个权限点
    });
  });
});
