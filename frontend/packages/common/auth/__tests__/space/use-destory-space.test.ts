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

// 模拟 store
const mockDestory = vi.fn();
vi.mock('../../src/space/store', () => ({
  useSpaceAuthStore: vi.fn(selector => selector({ destory: mockDestory })),
}));

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

import { useDestorySpace } from '../../src/space/use-destory-space';

describe('useDestorySpace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanupFns.clear();
  });

  it('应该在组件卸载时调用 destory 方法', () => {
    const spaceId = 'test-space-id';

    // 渲染 hook
    const { unmount } = renderHookWithCleanup(() => useDestorySpace(spaceId));

    // 初始时不应调用 destory
    expect(mockDestory).not.toHaveBeenCalled();

    // 模拟组件卸载
    unmount();

    // 卸载时应调用 destory 并传入正确的 spaceId
    expect(mockDestory).toHaveBeenCalledTimes(1);
    expect(mockDestory).toHaveBeenCalledWith(spaceId);
  });

  it('应该为不同的 spaceId 调用 destory 方法', () => {
    const spaceId1 = 'space-id-1';
    const spaceId2 = 'space-id-2';

    // 渲染第一个 hook 实例
    const { unmount: unmount1 } = renderHookWithCleanup(() =>
      useDestorySpace(spaceId1),
    );

    // 渲染第二个 hook 实例
    const { unmount: unmount2 } = renderHookWithCleanup(() =>
      useDestorySpace(spaceId2),
    );

    // 卸载第一个实例
    unmount1();
    expect(mockDestory).toHaveBeenCalledWith(spaceId1);

    // 卸载第二个实例
    unmount2();
    expect(mockDestory).toHaveBeenCalledWith(spaceId2);

    // 总共应调用两次
    expect(mockDestory).toHaveBeenCalledTimes(4);
  });
});
