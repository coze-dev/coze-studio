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
import { ProjectRoleType, useProjectAuthStore } from '@coze-common/auth';

import { useInitProjectRole } from '../../src/project/use-init-project-role';

// Mock the auth store
vi.mock('@coze-common/auth', () => ({
  useProjectAuthStore: vi.fn(),
  ProjectRoleType: {
    Owner: 'owner',
  },
}));

describe('useInitProjectRole', () => {
  const mockIsReady = {
    'project-1': true,
    'project-2': true,
  };
  const mockSetIsReady = vi.fn();
  const mockSetRoles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useProjectAuthStore as any).mockImplementation((selector: any) =>
      selector({
        setIsReady: mockSetIsReady,
        setRoles: mockSetRoles,
        isReady: mockIsReady,
      }),
    );
  });

  it('should initialize project role and set ready state', () => {
    const spaceId = 'space-1';
    const projectId = 'project-1';
    const { result } = renderHook(() => useInitProjectRole(spaceId, projectId));

    console.log('result', result.current);
    console.log('mockIsReady', mockIsReady);

    // Verify that setRoles and setIsReady are called
    expect(mockSetRoles).toHaveBeenCalledWith(projectId, [
      ProjectRoleType.Owner,
    ]);
    expect(mockSetIsReady).toHaveBeenCalledWith(projectId, true);

    // Validate the return value
    expect(result.current).toBe(true);
  });

  it('should handle multiple project IDs correctly', () => {
    const testSpaceId = 'space-1';
    const projectId1 = 'project-1';
    const projectId2 = 'project-2';

    const { rerender } = renderHook(
      ({ spaceId, projectId }) => useInitProjectRole(spaceId, projectId),
      {
        initialProps: { spaceId: testSpaceId, projectId: projectId1 },
      },
    );

    expect(mockSetRoles).toHaveBeenCalledWith(projectId1, [
      ProjectRoleType.Owner,
    ]);
    expect(mockSetIsReady).toHaveBeenCalledWith(projectId1, true);

    // Render again, using the new projectId
    rerender({ spaceId: testSpaceId, projectId: projectId2 });

    expect(mockSetRoles).toHaveBeenCalledWith(projectId2, [
      ProjectRoleType.Owner,
    ]);
    expect(mockSetIsReady).toHaveBeenCalledWith(projectId2, true);
  });
});
