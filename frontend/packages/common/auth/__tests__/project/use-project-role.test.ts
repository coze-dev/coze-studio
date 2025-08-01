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

import { useProjectRole } from '../../src/project/use-project-role';
import { useProjectAuthStore } from '../../src/project/store';
import { ProjectRoleType } from '../../src/project/constants';

// simulated dependency
vi.mock('../../src/project/store', () => ({
  useProjectAuthStore: vi.fn(),
}));

describe('useProjectRole', () => {
  const projectId = 'test-project-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回正确的项目角色', () => {
    const expectedRoles = [ProjectRoleType.Owner];

    // Mock useProjectAuthStore returns project role and ready state
    (useProjectAuthStore as any).mockReturnValue({
      isReady: true,
      role: expectedRoles,
    });

    // Render hook
    const { result } = renderHook(() => useProjectRole(projectId));

    // Verify useProjectAuthStore is called
    expect(useProjectAuthStore).toHaveBeenCalled();

    // Validate the return value
    expect(result.current).toEqual(expectedRoles);
  });

  it('应该在项目未准备好时抛出错误', () => {
    // Simulate useProjectAuthStore returns an unprepared state
    (useProjectAuthStore as any).mockReturnValue({
      isReady: false,
      role: [],
    });

    // Use vi.spyOn to listen to console.error to prevent test output error messages
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Empty implementation to prevent error output
    });

    // validation throws error
    expect(() => {
      const { result } = renderHook(() => useProjectRole(projectId));
      // Force access result.current trigger error
      console.log(result.current);
    }).toThrow(
      'useProjectAuth must be used after useInitProjectRole has been completed.',
    );
  });

  it('应该在角色为 undefined 时返回空数组', () => {
    // Emulate useProjectAuthStore returns undefined role
    (useProjectAuthStore as any).mockReturnValue({
      isReady: true,
      role: undefined,
    });

    // Render hook
    const { result } = renderHook(() => useProjectRole(projectId));

    // Verify that the return value is an empty array
    expect(result.current).toEqual([]);
  });

  it('应该处理多种角色类型', () => {
    const expectedRoles = [ProjectRoleType.Owner, ProjectRoleType.Editor];

    // Emulate useProjectAuthStore returns multiple roles
    (useProjectAuthStore as any).mockReturnValue({
      isReady: true,
      role: expectedRoles,
    });

    // Render hook
    const { result } = renderHook(() => useProjectRole(projectId));

    // Validate the return value
    expect(result.current).toEqual(expectedRoles);
  });
});
