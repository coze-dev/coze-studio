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

// 模拟 zustand
vi.mock('zustand/react/shallow', () => ({
  useShallow: fn => fn,
}));

// 模拟 foundation-sdk
const mockUseSpace = vi.fn();
vi.mock('@coze-arch/foundation-sdk', () => ({
  useSpace: (...args) => mockUseSpace(...args),
}));

// 模拟 store
vi.mock('../../src/space/store', () => ({
  useSpaceAuthStore: vi.fn(),
}));

// 导入实际模块，确保在模拟之后导入
import { useSpaceRole } from '../../src/space/use-space-role';

describe('useSpaceRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该在 space 存在且 isReady 为 true 时返回角色', () => {
    const spaceId = 'test-space-id';
    const mockSpace = { id: spaceId, name: 'Test Space' };
    const mockRoles = [SpaceRoleType.Owner];

    // 模拟 useSpace 返回 space 对象
    mockUseSpace.mockReturnValue(mockSpace);

    // 模拟 useSpaceAuthStore 返回 isReady 和 role
    (useSpaceAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isReady: true,
      role: mockRoles,
    });

    // 渲染 hook
    const { result } = renderHook(() => useSpaceRole(spaceId));

    // 验证 useSpace 被调用，并传入正确的 spaceId
    expect(mockUseSpace).toHaveBeenCalledWith(spaceId);

    // 验证 useSpaceAuthStore 被调用，并传入正确的选择器
    expect(useSpaceAuthStore).toHaveBeenCalled();

    // 验证返回值与预期一致
    expect(result.current).toEqual(mockRoles);
  });

  it('应该在 space 不存在时抛出错误', () => {
    const spaceId = 'test-space-id';

    // 模拟 useSpace 返回 null
    mockUseSpace.mockReturnValue(null);

    // 使用 vi.spyOn 监听 console.error 以防止测试输出错误信息
    vi.spyOn(console, 'error').mockImplementation(() => {
      // 空实现，防止错误输出
    });

    // 验证渲染 hook 时抛出错误
    expect(() => useSpaceRole(spaceId)).toThrow(
      'useSpaceAuth must be used after space list has been pulled.',
    );
  });

  it('应该在 isReady 为 false 时抛出错误', () => {
    const spaceId = 'test-space-id';
    const mockSpace = { id: spaceId, name: 'Test Space' };

    // 模拟 useSpace 返回 space 对象
    mockUseSpace.mockReturnValue(mockSpace);

    // 模拟 useSpaceAuthStore 返回 isReady 为 false
    (useSpaceAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isReady: false,
      role: null,
    });

    // 使用 vi.spyOn 监听 console.error 以防止测试输出错误信息
    vi.spyOn(console, 'error').mockImplementation(() => {
      // 空实现，防止错误输出
    });

    // 验证渲染 hook 时抛出错误
    expect(() => useSpaceRole(spaceId)).toThrow(
      'useSpaceAuth must be used after useInitSpaceRole has been completed.',
    );
  });

  it('应该在 role 不存在时抛出错误', () => {
    const spaceId = 'test-space-id';
    const mockSpace = { id: spaceId, name: 'Test Space' };

    // 模拟 useSpace 返回 space 对象
    mockUseSpace.mockReturnValue(mockSpace);

    // 模拟 useSpaceAuthStore 返回 isReady 为 true，但 role 为 null
    (useSpaceAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isReady: true,
      role: null,
    });

    // 使用 vi.spyOn 监听 console.error 以防止测试输出错误信息
    vi.spyOn(console, 'error').mockImplementation(() => {
      // 空实现，防止错误输出
    });

    // 验证渲染 hook 时抛出错误
    expect(() => useSpaceRole(spaceId)).toThrow(
      `Can not get space role of space: ${spaceId}`,
    );
  });
});
