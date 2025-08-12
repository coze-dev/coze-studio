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

// simulated dependency
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

    // Simulating useSpace returns spatial information
    (useSpace as any).mockReturnValue({
      space_type: SpaceType.Team,
    });

    // Simulate useSpaceRole Return Space Role
    (useSpaceRole as any).mockReturnValue([SpaceRoleType.Member]);

    // Simulate useProjectRole Return project role
    (useProjectRole as any).mockReturnValue([ProjectRoleType.Editor]);

    // Simulate calcPermission return permission result
    (calcPermission as any).mockReturnValue(true);
  });

  it('应该调用 calcPermission 并返回正确的权限结果', () => {
    // Render hook
    const { result } = renderHook(() =>
      useProjectAuth(permissionKey, projectId, spaceId),
    );

    // Verify that useSpace is called
    expect(useSpace).toHaveBeenCalledWith(spaceId);

    // Verify useSpaceRole is called
    expect(useSpaceRole).toHaveBeenCalledWith(spaceId);

    // Verify useProjectRole is called
    expect(useProjectRole).toHaveBeenCalledWith(projectId);

    // Verify that calcPermission is called and the parameters are correct
    expect(calcPermission).toHaveBeenCalledWith(permissionKey, {
      projectRoles: [ProjectRoleType.Editor],
      spaceRoles: [SpaceRoleType.Member],
      spaceType: SpaceType.Team,
    });

    // Validate the return value
    expect(result.current).toBe(true);
  });

  it('应该在 calcPermission 返回 false 时返回 false', () => {
    // simulated calcPermission returns false
    (calcPermission as any).mockReturnValue(false);

    // Render hook
    const { result } = renderHook(() =>
      useProjectAuth(permissionKey, projectId, spaceId),
    );

    // Validate the return value
    expect(result.current).toBe(false);
  });

  it('应该在空间类型不存在时抛出错误', () => {
    // Mock useSpace returns objects without space_type
    (useSpace as any).mockReturnValue({});

    // Use vi.spyOn to listen to console.error to prevent test output error messages
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Empty implementation to prevent error output
    });

    // validation throws error
    expect(() => {
      const { result } = renderHook(() =>
        useProjectAuth(permissionKey, projectId, spaceId),
      );
      // Force access result.current trigger error
      console.log(result.current);
    }).toThrow('useSpaceAuth must be used after space list has been pulled.');
  });

  it('应该在空间为 null 时抛出错误', () => {
    // Simulate useSpace returns null
    (useSpace as any).mockReturnValue(null);

    // Use vi.spyOn to listen to console.error to prevent test output error messages
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Empty implementation to prevent error output
    });

    // validation throws error
    expect(() => {
      const { result } = renderHook(() =>
        useProjectAuth(permissionKey, projectId, spaceId),
      );
      // Force access result.current trigger error
      console.log(result.current);
    }).toThrow('useSpaceAuth must be used after space list has been pulled.');
  });
});
