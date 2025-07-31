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
import { SpaceRoleType, SpaceType } from '@coze-arch/idl/developer_api';

import {
  ProjectRoleType,
  EProjectPermission,
} from '../../src/project/constants';
import { calcPermission } from '../../src/project/calc-permission';

describe('Project Calc Permission', () => {
  describe('个人空间权限', () => {
    it('应该为个人空间返回正确的权限', () => {
      const params = {
        projectRoles: [],
        spaceRoles: [],
        spaceType: SpaceType.Personal,
      };

      // Personal space should have viewing permission
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // Personal space should have permission to edit information
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(true);

      // Personal space should have deletion permission
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(true);

      // Personal space should have publishing permission
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(true);

      // Personal space should have permission to create resources
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        true,
      );

      // Personal space should have permission to copy resources
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        true,
      );

      // Personal space should have permission to copy items
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // Personal space should have test run plug-in permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        true,
      );

      // Personal space should have test run workflow permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );
    });

    it('应该为个人空间返回正确的无效权限', () => {
      const params = {
        projectRoles: [],
        spaceRoles: [],
        spaceType: SpaceType.Personal,
      };

      // Personal Spaces should not have Add Collaborators permissions
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        false,
      );

      // Personal space should not have permission to delete collaborators
      expect(
        calcPermission(EProjectPermission.DELETE_COLLABORATOR, params),
      ).toBe(false);
    });
  });

  describe('团队空间项目角色权限', () => {
    it('应该为项目所有者角色返回正确的权限', () => {
      const params = {
        projectRoles: [ProjectRoleType.Owner],
        spaceRoles: [],
        spaceType: SpaceType.Team,
      };

      // The project owner should have viewing rights
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // The project owner should have permission to edit the information
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(true);

      // The project owner should have delete permissions
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(true);

      // The project owner should have publishing rights
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(true);

      // The project owner should have the Create Resource permission
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        true,
      );

      // The project owner should have permission to copy the resource
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        true,
      );

      // The project owner should have permission to copy the project
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // The project owner should have test run plug-in permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        true,
      );

      // The project owner should have test run workflow permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );

      // The project owner should have permission to add collaborators
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        true,
      );

      // The project owner should have the Delete Collaborator permission
      expect(
        calcPermission(EProjectPermission.DELETE_COLLABORATOR, params),
      ).toBe(true);
    });

    it('应该为项目编辑者角色返回正确的权限', () => {
      const params = {
        projectRoles: [ProjectRoleType.Editor],
        spaceRoles: [],
        spaceType: SpaceType.Team,
      };

      // Project editors should have viewing rights
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // Project editors should have permission to edit information
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(true);

      // Project editors should have the Create Resource permission
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        true,
      );

      // Project editors should have permission to copy resources
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        true,
      );

      // The project editor should have permission to copy the project
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // Project editors should have test run plug-in permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        true,
      );

      // The project editor should have test run workflow permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );

      // Project editors should have Add Collaborators permission
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        true,
      );

      // Project editors should not have delete permissions
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(false);

      // Project editors should not have permission to publish
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(false);

      // Project editors should not have permission to delete collaborators
      expect(
        calcPermission(EProjectPermission.DELETE_COLLABORATOR, params),
      ).toBe(false);
    });
  });

  describe('团队空间角色权限', () => {
    it('应该为空间成员角色返回正确的权限', () => {
      const params = {
        projectRoles: [],
        spaceRoles: [SpaceRoleType.Member],
        spaceType: SpaceType.Team,
      };

      // Space members should have viewing rights
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // Space members should have permission to copy items
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // Space members should have test run workflow permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );

      // Space members should not have permission to edit information
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(false);

      // Space members should not have delete permissions
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(false);

      // Space members should not have publishing privileges
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(false);

      // Space members should not have permission to create resources
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        false,
      );

      // Space members should not have permission to copy resources
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        false,
      );

      // Space members should not have test run plug-in permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        false,
      );

      // Space members should not have Add Collaborator permissions
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        false,
      );

      // Space members should not have permission to delete collaborators
      expect(
        calcPermission(EProjectPermission.DELETE_COLLABORATOR, params),
      ).toBe(false);
    });

    it('应该为空间所有者角色返回正确的权限', () => {
      const params = {
        projectRoles: [],
        spaceRoles: [SpaceRoleType.Owner],
        spaceType: SpaceType.Team,
      };

      // Space owners should have viewing rights
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // The space owner should have permission to copy items
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // Space owners should have test run workflow permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );
    });

    it('应该为空间管理员角色返回正确的权限', () => {
      const params = {
        projectRoles: [],
        spaceRoles: [SpaceRoleType.Admin],
        spaceType: SpaceType.Team,
      };

      // The space administrator should have viewing rights
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // The space administrator should have permission to copy items
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // The space administrator should have test run workflow permissions
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );
    });

    it('应该为默认角色返回正确的权限', () => {
      const params = {
        projectRoles: [],
        spaceRoles: [SpaceRoleType.Default],
        spaceType: SpaceType.Team,
      };

      // The default role should not have any permissions
      expect(calcPermission(EProjectPermission.View, params)).toBe(false);
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(false);
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(false);
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(false);
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(false);
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        false,
      );
      expect(
        calcPermission(EProjectPermission.DELETE_COLLABORATOR, params),
      ).toBe(false);
    });
  });

  describe('混合角色权限', () => {
    it('应该在同时拥有项目角色和空间角色时返回正确的权限', () => {
      const params = {
        projectRoles: [ProjectRoleType.Editor],
        spaceRoles: [SpaceRoleType.Member],
        spaceType: SpaceType.Team,
      };

      // Should have all the permissions of the project editor
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(true);
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        true,
      );
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        true,
      );
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        true,
      );
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        true,
      );

      // There should be no permissions that the project editor does not have
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(false);
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(false);
      expect(
        calcPermission(EProjectPermission.DELETE_COLLABORATOR, params),
      ).toBe(false);
    });

    it('应该在没有有效角色时返回 false', () => {
      const params = {
        projectRoles: [],
        spaceRoles: [],
        spaceType: SpaceType.Team,
      };

      // No role should have no permissions
      expect(calcPermission(EProjectPermission.View, params)).toBe(false);
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(false);
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(false);
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(false);
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(false);
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        false,
      );
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        false,
      );
      expect(
        calcPermission(EProjectPermission.DELETE_COLLABORATOR, params),
      ).toBe(false);
    });
  });
});
