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

// 模拟 React 的 useEffect
const cleanupFns = new Map();
vi.mock('react', () => ({
  useEffect: vi.fn((fn, deps) => {
    // 执行 effect 函数并获取清理函数
    const cleanup = fn();
    // 存储清理函数，以便在 unmount 时调用
    cleanupFns.set(fn, cleanup);
    // 返回清理函数
    return cleanup;
  }),
}));

import { useDestoryProject } from '../../src/project/use-destory-project';
import { useProjectAuthStore } from '../../src/project/store';

// 模拟 useProjectAuthStore
vi.mock('../../src/project/store', () => {
  const destorySpy = vi.fn();
  return {
    useProjectAuthStore: vi.fn(() => destorySpy),
  };
});

// 创建一个包装函数，确保在 unmount 时调用清理函数
function renderHookWithCleanup(callback, options = {}) {
  const result = renderHook(callback, options);
  const originalUnmount = result.unmount;

  result.unmount = () => {
    // 调用所有清理函数
    cleanupFns.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    // 调用原始的 unmount
    originalUnmount();
  };

  return result;
}

describe('useDestoryProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanupFns.clear();
  });

  it('应该在组件卸载时调用 destory 方法', () => {
    const projectId = 'test-project-id';
    const destorySpy = vi.fn();

    // 模拟 useProjectAuthStore 返回 destorySpy
    (useProjectAuthStore as any).mockReturnValue(destorySpy);

    // 渲染 hook
    const { unmount } = renderHookWithCleanup(() =>
      useDestoryProject(projectId),
    );

    // 验证初始状态下 destory 未被调用
    expect(destorySpy).not.toHaveBeenCalled();

    // 卸载组件
    unmount();

    // 验证 destory 被调用，且参数正确
    expect(destorySpy).toHaveBeenCalledTimes(1);
    expect(destorySpy).toHaveBeenCalledWith(projectId);
  });

  it('应该在组件卸载时清除正确的项目数据', () => {
    const projectId1 = 'test-project-id-1';
    const destorySpy = vi.fn();

    // 模拟 useProjectAuthStore 返回 destorySpy
    (useProjectAuthStore as any).mockReturnValue(destorySpy);

    // 渲染 hook
    const { unmount } = renderHookWithCleanup(() =>
      useDestoryProject(projectId1),
    );

    // 卸载组件
    unmount();

    // 验证 destory 被调用，且参数为 projectId1
    expect(destorySpy).toHaveBeenCalledTimes(1);
    expect(destorySpy).toHaveBeenCalledWith(projectId1);
  });

  it('应该为不同的项目ID调用不同的清理函数', () => {
    const projectId2 = 'test-project-id-2';
    const destorySpy = vi.fn();

    // 清除之前的所有模拟和清理函数
    vi.clearAllMocks();
    cleanupFns.clear();

    // 模拟 useProjectAuthStore 返回 destorySpy
    (useProjectAuthStore as any).mockReturnValue(destorySpy);

    // 渲染 hook
    const { unmount } = renderHookWithCleanup(() =>
      useDestoryProject(projectId2),
    );

    // 卸载组件
    unmount();

    // 验证 destory 被调用，且参数为 projectId2
    expect(destorySpy).toHaveBeenCalledTimes(1);
    expect(destorySpy).toHaveBeenCalledWith(projectId2);
  });
});
