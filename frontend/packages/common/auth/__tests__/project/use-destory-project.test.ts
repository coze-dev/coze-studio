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

import { useDestoryProject } from '../../src/project/use-destory-project';
import { useProjectAuthStore } from '../../src/project/store';

// emulation useProjectAuthStore
vi.mock('../../src/project/store', () => {
  const destorySpy = vi.fn();
  return {
    useProjectAuthStore: vi.fn(() => destorySpy),
  };
});

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

describe('useDestoryProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanupFns.clear();
  });

  it('应该在组件卸载时调用 destory 方法', () => {
    const projectId = 'test-project-id';
    const destorySpy = vi.fn();

    // Emulate useProjectAuthStore returns destorySpy
    (useProjectAuthStore as any).mockReturnValue(destorySpy);

    // Render hook
    const { unmount } = renderHookWithCleanup(() =>
      useDestoryProject(projectId),
    );

    // Verify that destory is not called in the initial state
    expect(destorySpy).not.toHaveBeenCalled();

    // uninstall components
    unmount();

    // Verify that destory is called and the parameters are correct
    expect(destorySpy).toHaveBeenCalledTimes(1);
    expect(destorySpy).toHaveBeenCalledWith(projectId);
  });

  it('应该在组件卸载时清除正确的项目数据', () => {
    const projectId1 = 'test-project-id-1';
    const destorySpy = vi.fn();

    // Emulate useProjectAuthStore returns destorySpy
    (useProjectAuthStore as any).mockReturnValue(destorySpy);

    // Render hook
    const { unmount } = renderHookWithCleanup(() =>
      useDestoryProject(projectId1),
    );

    // uninstall components
    unmount();

    // Verify that destory is called with the parameter projectId1.
    expect(destorySpy).toHaveBeenCalledTimes(1);
    expect(destorySpy).toHaveBeenCalledWith(projectId1);
  });

  it('应该为不同的项目ID调用不同的清理函数', () => {
    const projectId2 = 'test-project-id-2';
    const destorySpy = vi.fn();

    // Clear all previous simulation and cleanup functions
    vi.clearAllMocks();
    cleanupFns.clear();

    // Emulate useProjectAuthStore returns destorySpy
    (useProjectAuthStore as any).mockReturnValue(destorySpy);

    // Render hook
    const { unmount } = renderHookWithCleanup(() =>
      useDestoryProject(projectId2),
    );

    // uninstall components
    unmount();

    // Verify that destory is called with the parameter projectId2.
    expect(destorySpy).toHaveBeenCalledTimes(1);
    expect(destorySpy).toHaveBeenCalledWith(projectId2);
  });
});
