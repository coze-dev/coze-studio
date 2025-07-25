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
 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { SpaceType } from '@coze-arch/idl/developer_api';
import { useSpace } from '@coze-arch/foundation-sdk';

import { useSpaceRole } from '../../src/space/use-space-role';
import { SpaceRoleType } from '../../src/space/constants';
import { useProjectRole } from '../../src/project/use-project-role';
import { useProjectAuth } from '../../src/project/use-project-auth';
import {
  EProjectPermission,
  ProjectRoleType,
} from '../../src/project/constants';
import { calcPermission } from '../../src/project/calc-permission';

// 模拟依赖
vi.mock('@coze-arch/foundation-sdk', () => ({
  useSpace: vi.fn(),
}));

vi.mock('../../src/space/use-space-role', () => ({
  useSpaceRole: vi.fn(),
}));

vi.mock('../../src/project/use-project-role', () => ({
  useProjectRole: vi.fn(),
}));

vi.mock('../../src/project/calc-permission', () => ({
  calcPermission: vi.fn(),
}));

describe('useProjectAuth', () => {
  const projectId = 'test-project-id';
  const spaceId = 'test-space-id';
  const permissionKey = EProjectPermission.View;

  beforeEach(() => {
    vi.clearAllMocks();

    // 模拟 useSpace 返回空间信息
    (useSpace as any).mockReturnValue({
      space_type: SpaceType.Team,
    });

    // 模拟 useSpaceRole 返回空间角色
    (useSpaceRole as any).mockReturnValue([SpaceRoleType.Member]);

    // 模拟 useProjectRole 返回项目角色
    (useProjectRole as any).mockReturnValue([ProjectRoleType.Editor]);

    // 模拟 calcPermission 返回权限结果
    (calcPermission as any).mockReturnValue(true);
  });

  it('应该调用 calcPermission 并返回正确的权限结果', () => {
    // 渲染 hook
    const { result } = renderHook(() =>
      useProjectAuth(permissionKey, projectId, spaceId),
    );

    // 验证 useSpace 被调用
    expect(useSpace).toHaveBeenCalledWith(spaceId);

    // 验证 useSpaceRole 被调用
    expect(useSpaceRole).toHaveBeenCalledWith(spaceId);

    // 验证 useProjectRole 被调用
    expect(useProjectRole).toHaveBeenCalledWith(projectId);

    // 验证 calcPermission 被调用，且参数正确
    expect(calcPermission).toHaveBeenCalledWith(permissionKey, {
      projectRoles: [ProjectRoleType.Editor],
      spaceRoles: [SpaceRoleType.Member],
      spaceType: SpaceType.Team,
    });

    // 验证返回值
    expect(result.current).toBe(true);
  });

  it('应该在 calcPermission 返回 false 时返回 false', () => {
    // 模拟 calcPermission 返回 false
    (calcPermission as any).mockReturnValue(false);

    // 渲染 hook
    const { result } = renderHook(() =>
      useProjectAuth(permissionKey, projectId, spaceId),
    );

    // 验证返回值
    expect(result.current).toBe(false);
  });

  it('应该在空间类型不存在时抛出错误', () => {
    // 模拟 useSpace 返回没有 space_type 的对象
    (useSpace as any).mockReturnValue({});

    // 使用 vi.spyOn 监听 console.error 以防止测试输出错误信息
    vi.spyOn(console, 'error').mockImplementation(() => {
      // 空实现，防止错误输出
    });

    // 验证抛出错误
    expect(() => {
      const { result } = renderHook(() =>
        useProjectAuth(permissionKey, projectId, spaceId),
      );
      // 强制访问 result.current 触发错误
      console.log(result.current);
    }).toThrow('useSpaceAuth must be used after space list has been pulled.');
  });

  it('应该在空间为 null 时抛出错误', () => {
    // 模拟 useSpace 返回 null
    (useSpace as any).mockReturnValue(null);

    // 使用 vi.spyOn 监听 console.error 以防止测试输出错误信息
    vi.spyOn(console, 'error').mockImplementation(() => {
      // 空实现，防止错误输出
    });

    // 验证抛出错误
    expect(() => {
      const { result } = renderHook(() =>
        useProjectAuth(permissionKey, projectId, spaceId),
      );
      // 强制访问 result.current 触发错误
      console.log(result.current);
    }).toThrow('useSpaceAuth must be used after space list has been pulled.');
  });
});
