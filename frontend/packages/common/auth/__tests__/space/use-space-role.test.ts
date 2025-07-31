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
import { SpaceRoleType } from '@coze-arch/idl/developer_api';

import { useSpaceAuthStore } from '../../src/space/store';

// Analog zustand
vi.mock('zustand/react/shallow', () => ({
  useShallow: fn => fn,
}));

// Simulation foundation-sdk
const mockUseSpace = vi.fn();
vi.mock('@coze-arch/foundation-sdk', () => ({
  useSpace: (...args) => mockUseSpace(...args),
}));

// Simulated store
vi.mock('../../src/space/store', () => ({
  useSpaceAuthStore: vi.fn(),
}));

// Import the actual module, make sure to import it after simulation
import { useSpaceRole } from '../../src/space/use-space-role';

describe('useSpaceRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在 space 存在且 isReady 为 true 时返回角色', () => {
    const spaceId = 'test-space-id';
    const mockSpace = { id: spaceId, name: 'Test Space' };
    const mockRoles = [SpaceRoleType.Owner];

    // Simulate useSpace Return space object
    mockUseSpace.mockReturnValue(mockSpace);

    // Emulate useSpaceAuthStore returns isReady and role
    (useSpaceAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isReady: true,
      role: mockRoles,
    });

    // Render hook
    const { result } = renderHook(() => useSpaceRole(spaceId));

    // Verify that useSpace is called, passing in the correct spaceId.
    expect(mockUseSpace).toHaveBeenCalledWith(spaceId);

    // Verify that useSpaceAuthStore is called, passing in the correct selector
    expect(useSpaceAuthStore).toHaveBeenCalled();

    // Verify that the return value is as expected
    expect(result.current).toEqual(mockRoles);
  });

  it('应该在 space 不存在时抛出错误', () => {
    const spaceId = 'test-space-id';

    // Simulate useSpace returns null
    mockUseSpace.mockReturnValue(null);

    // Use vi.spyOn to listen to console.error to prevent test output error messages
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Empty implementation to prevent error output
    });

    // Error thrown while validating render hook
    expect(() => useSpaceRole(spaceId)).toThrow(
      'useSpaceAuth must be used after space list has been pulled.',
    );
  });

  it('应该在 isReady 为 false 时抛出错误', () => {
    const spaceId = 'test-space-id';
    const mockSpace = { id: spaceId, name: 'Test Space' };

    // Simulate useSpace Return space object
    mockUseSpace.mockReturnValue(mockSpace);

    // Emulate useSpaceAuthStore returns isReady to false
    (useSpaceAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isReady: false,
      role: null,
    });

    // Use vi.spyOn to listen to console.error to prevent test output error messages
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Empty implementation to prevent error output
    });

    // Error thrown while validating render hook
    expect(() => useSpaceRole(spaceId)).toThrow(
      'useSpaceAuth must be used after useInitSpaceRole has been completed.',
    );
  });

  it('应该在 role 不存在时抛出错误', () => {
    const spaceId = 'test-space-id';
    const mockSpace = { id: spaceId, name: 'Test Space' };

    // Simulate useSpace Return space object
    mockUseSpace.mockReturnValue(mockSpace);

    // Emulate useSpaceAuthStore returns isReady as true, but role as null
    (useSpaceAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isReady: true,
      role: null,
    });

    // Use vi.spyOn to listen to console.error to prevent test output error messages
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Empty implementation to prevent error output
    });

    // Error thrown while validating render hook
    expect(() => useSpaceRole(spaceId)).toThrow(
      `Can not get space role of space: ${spaceId}`,
    );
  });
});
