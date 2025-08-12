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

// The useEffect of React
const cleanupFns = new Map();
vi.mock('react', () => ({
  useEffect: vi.fn((fn, deps) => {
    // Execute the effect function and get the cleanup function
    const cleanup = fn();
    // Store the cleanup function to call when unmounted
    cleanupFns.set(fn, cleanup);
    // Return cleanup function
    return cleanup;
  }),
}));

// Simulated store
const mockDestory = vi.fn();
vi.mock('../../src/space/store', () => ({
  useSpaceAuthStore: vi.fn(selector => selector({ destory: mockDestory })),
}));

// Create a wrapper function to ensure that the cleanup function is called when unmounted
function renderHookWithCleanup(callback, options = {}) {
  const result = renderHook(callback, options);
  const originalUnmount = result.unmount;

  result.unmount = () => {
    // Call all cleanup functions
    cleanupFns.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    // Call the original unmount
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

    // Render hook
    const { unmount } = renderHookWithCleanup(() => useDestorySpace(spaceId));

    // Destory should not be called initially
    expect(mockDestory).not.toHaveBeenCalled();

    // Simulate component uninstall
    unmount();

    // When uninstalling, call destory and pass in the correct spaceId.
    expect(mockDestory).toHaveBeenCalledTimes(1);
    expect(mockDestory).toHaveBeenCalledWith(spaceId);
  });

  it('应该为不同的 spaceId 调用 destory 方法', () => {
    const spaceId1 = 'space-id-1';
    const spaceId2 = 'space-id-2';

    // Render the first hook instance
    const { unmount: unmount1 } = renderHookWithCleanup(() =>
      useDestorySpace(spaceId1),
    );

    // Render the second hook instance
    const { unmount: unmount2 } = renderHookWithCleanup(() =>
      useDestorySpace(spaceId2),
    );

    // Uninstall the first instance
    unmount1();
    expect(mockDestory).toHaveBeenCalledWith(spaceId1);

    // Uninstall the second instance
    unmount2();
    expect(mockDestory).toHaveBeenCalledWith(spaceId2);

    // It should be called twice in total.
    expect(mockDestory).toHaveBeenCalledTimes(4);
  });
});
