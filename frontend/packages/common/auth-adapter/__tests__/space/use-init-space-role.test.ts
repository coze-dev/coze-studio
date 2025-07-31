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
import { useSpaceAuthStore } from '@coze-common/auth';
import { SpaceRoleType } from '@coze-arch/idl/developer_api';

import { useInitSpaceRole } from '../../src/space/use-init-space-role';

// Mock the auth store
vi.mock('@coze-common/auth', () => ({
  useSpaceAuthStore: vi.fn(),
}));

describe('useInitSpaceRole', () => {
  const mockSetIsReady = vi.fn();
  const mockSetRoles = vi.fn();
  const mockIsReady = {
    'space-1': true,
    'space-2': true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSpaceAuthStore as any).mockImplementation((selector: any) =>
      selector({
        setIsReady: mockSetIsReady,
        setRoles: mockSetRoles,
        isReady: mockIsReady,
      }),
    );
  });

  it('should initialize space role and set ready state', () => {
    const spaceId = 'space-1';
    const { result } = renderHook(() => useInitSpaceRole(spaceId));

    // Verify that setRoles and setIsReady are called
    expect(mockSetRoles).toHaveBeenCalledWith(spaceId, [SpaceRoleType.Owner]);
    expect(mockSetIsReady).toHaveBeenCalledWith(spaceId, true);

    // Validate the return value
    expect(result.current).toBe(true);
  });

  it('should handle multiple space IDs correctly', () => {
    const spaceId1 = 'space-1';
    const spaceId2 = 'space-2';

    const { rerender } = renderHook(({ id }) => useInitSpaceRole(id), {
      initialProps: { id: spaceId1 },
    });

    expect(mockSetRoles).toHaveBeenCalledWith(spaceId1, [SpaceRoleType.Owner]);
    expect(mockSetIsReady).toHaveBeenCalledWith(spaceId1, true);

    // Render again, using the new spaceId.
    rerender({ id: spaceId2 });

    expect(mockSetRoles).toHaveBeenCalledWith(spaceId2, [SpaceRoleType.Owner]);
    expect(mockSetIsReady).toHaveBeenCalledWith(spaceId2, true);
  });
});
