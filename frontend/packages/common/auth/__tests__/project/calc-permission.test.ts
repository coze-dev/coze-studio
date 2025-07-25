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

      // 个人空间应该有查看权限
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // 个人空间应该有编辑信息权限
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(true);

      // 个人空间应该有删除权限
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(true);

      // 个人空间应该有发布权限
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(true);

      // 个人空间应该有创建资源权限
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        true,
      );

      // 个人空间应该有复制资源权限
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        true,
      );

      // 个人空间应该有复制项目权限
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // 个人空间应该有测试运行插件权限
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        true,
      );

      // 个人空间应该有测试运行工作流权限
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

      // 个人空间不应该有添加协作者权限
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        false,
      );

      // 个人空间不应该有删除协作者权限
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

      // 项目所有者应该有查看权限
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // 项目所有者应该有编辑信息权限
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(true);

      // 项目所有者应该有删除权限
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(true);

      // 项目所有者应该有发布权限
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(true);

      // 项目所有者应该有创建资源权限
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        true,
      );

      // 项目所有者应该有复制资源权限
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        true,
      );

      // 项目所有者应该有复制项目权限
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // 项目所有者应该有测试运行插件权限
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        true,
      );

      // 项目所有者应该有测试运行工作流权限
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );

      // 项目所有者应该有添加协作者权限
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        true,
      );

      // 项目所有者应该有删除协作者权限
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

      // 项目编辑者应该有查看权限
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // 项目编辑者应该有编辑信息权限
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(true);

      // 项目编辑者应该有创建资源权限
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        true,
      );

      // 项目编辑者应该有复制资源权限
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        true,
      );

      // 项目编辑者应该有复制项目权限
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // 项目编辑者应该有测试运行插件权限
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        true,
      );

      // 项目编辑者应该有测试运行工作流权限
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );

      // 项目编辑者应该有添加协作者权限
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        true,
      );

      // 项目编辑者不应该有删除权限
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(false);

      // 项目编辑者不应该有发布权限
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(false);

      // 项目编辑者不应该有删除协作者权限
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

      // 空间成员应该有查看权限
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // 空间成员应该有复制项目权限
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // 空间成员应该有测试运行工作流权限
      expect(calcPermission(EProjectPermission.TEST_RUN_WORKFLOW, params)).toBe(
        true,
      );

      // 空间成员不应该有编辑信息权限
      expect(calcPermission(EProjectPermission.EDIT_INFO, params)).toBe(false);

      // 空间成员不应该有删除权限
      expect(calcPermission(EProjectPermission.DELETE, params)).toBe(false);

      // 空间成员不应该有发布权限
      expect(calcPermission(EProjectPermission.PUBLISH, params)).toBe(false);

      // 空间成员不应该有创建资源权限
      expect(calcPermission(EProjectPermission.CREATE_RESOURCE, params)).toBe(
        false,
      );

      // 空间成员不应该有复制资源权限
      expect(calcPermission(EProjectPermission.COPY_RESOURCE, params)).toBe(
        false,
      );

      // 空间成员不应该有测试运行插件权限
      expect(calcPermission(EProjectPermission.TEST_RUN_PLUGIN, params)).toBe(
        false,
      );

      // 空间成员不应该有添加协作者权限
      expect(calcPermission(EProjectPermission.ADD_COLLABORATOR, params)).toBe(
        false,
      );

      // 空间成员不应该有删除协作者权限
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

      // 空间所有者应该有查看权限
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // 空间所有者应该有复制项目权限
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // 空间所有者应该有测试运行工作流权限
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

      // 空间管理员应该有查看权限
      expect(calcPermission(EProjectPermission.View, params)).toBe(true);

      // 空间管理员应该有复制项目权限
      expect(calcPermission(EProjectPermission.COPY, params)).toBe(true);

      // 空间管理员应该有测试运行工作流权限
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

      // 默认角色不应该有任何权限
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

      // 应该有项目编辑者的所有权限
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

      // 不应该有项目编辑者没有的权限
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

      // 没有角色不应该有任何权限
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
