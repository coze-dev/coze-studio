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

// 模拟依赖
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

    // 模拟 useProjectAuthStore 返回项目角色和 ready 状态
    (useProjectAuthStore as any).mockReturnValue({
      isReady: true,
      role: expectedRoles,
    });

    // 渲染 hook
    const { result } = renderHook(() => useProjectRole(projectId));

    // 验证 useProjectAuthStore 被调用
    expect(useProjectAuthStore).toHaveBeenCalled();

    // 验证返回值
    expect(result.current).toEqual(expectedRoles);
  });

  it('应该在项目未准备好时抛出错误', () => {
    // 模拟 useProjectAuthStore 返回未准备好的状态
    (useProjectAuthStore as any).mockReturnValue({
      isReady: false,
      role: [],
    });

    // 使用 vi.spyOn 监听 console.error 以防止测试输出错误信息
    vi.spyOn(console, 'error').mockImplementation(() => {
      // 空实现，防止错误输出
    });

    // 验证抛出错误
    expect(() => {
      const { result } = renderHook(() => useProjectRole(projectId));
      // 强制访问 result.current 触发错误
      console.log(result.current);
    }).toThrow(
      'useProjectAuth must be used after useInitProjectRole has been completed.',
    );
  });

  it('应该在角色为 undefined 时返回空数组', () => {
    // 模拟 useProjectAuthStore 返回 undefined 角色
    (useProjectAuthStore as any).mockReturnValue({
      isReady: true,
      role: undefined,
    });

    // 渲染 hook
    const { result } = renderHook(() => useProjectRole(projectId));

    // 验证返回值为空数组
    expect(result.current).toEqual([]);
  });

  it('应该处理多种角色类型', () => {
    const expectedRoles = [ProjectRoleType.Owner, ProjectRoleType.Editor];

    // 模拟 useProjectAuthStore 返回多种角色
    (useProjectAuthStore as any).mockReturnValue({
      isReady: true,
      role: expectedRoles,
    });

    // 渲染 hook
    const { result } = renderHook(() => useProjectRole(projectId));

    // 验证返回值
    expect(result.current).toEqual(expectedRoles);
  });
});
