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

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useValue } from '../../src/hooks/use-value';
import { localStorageService } from '../../src/core';

describe('useValue', () => {
  const permanentKey = 'workflow-toolbar-role-onboarding-hidden';

  beforeEach(() => {
    localStorage.clear();
    localStorageService.setUserId(undefined);
  });

  it('应该返回存储的值', async () => {
    const value = 'test-value';
    localStorageService.setValue(permanentKey, value);

    // Wait for the event to fire
    await new Promise(resolve => setTimeout(resolve, 0));

    const { result } = renderHook(() => useValue(permanentKey));
    expect(result.current).toBe(value);
  });

  it('当值改变时应该更新', async () => {
    const { result } = renderHook(() => useValue(permanentKey));

    // Wait for the event to fire
    await new Promise(resolve => setTimeout(resolve, 0));

    await act(async () => {
      localStorageService.setValue(permanentKey, 'new-value');
      // Wait for the event to fire
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toBe('new-value');
  });

  it('当值被删除时应该返回 undefined', async () => {
    localStorageService.setValue(permanentKey, 'test-value');

    // Wait for the event to fire
    await new Promise(resolve => setTimeout(resolve, 0));

    const { result } = renderHook(() => useValue(permanentKey));

    await act(async () => {
      localStorageService.setValue(permanentKey, undefined);
      // Wait for the event to fire
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toBeUndefined();
  });

  it('卸载时应该清理事件监听', async () => {
    const { unmount } = renderHook(() => useValue(permanentKey));

    // Wait for the event to fire
    await new Promise(resolve => setTimeout(resolve, 0));

    unmount();

    // Make sure that status updates for uninstalled components are not triggered
    localStorageService.setValue(permanentKey, 'new-value');
    // If the event listener is not cleaned up, a React warning will be thrown here
  });

  describe('用户相关的值', () => {
    // Use a key that confirms the user is bound.
    const userBindKey = 'coachmark' as const;
    const userId = 'test-user-id';

    beforeEach(() => {
      localStorageService.setUserId(userId);
    });

    it('应该返回当前用户的值', async () => {
      localStorageService.setValue(userBindKey, 'user-value');

      // Wait for the event to fire
      await new Promise(resolve => setTimeout(resolve, 0));

      const { result } = renderHook(() => useValue(userBindKey));
      expect(result.current).toBe('user-value');
    });

    it('切换用户时应该更新值', async () => {
      const userId2 = 'test-user-id-2';
      localStorageService.setValue(userBindKey, 'user1-value');

      // Wait for the event to fire
      await new Promise(resolve => setTimeout(resolve, 0));

      const { result } = renderHook(() => useValue(userBindKey));
      expect(result.current).toBe('user1-value');

      await act(async () => {
        localStorageService.setUserId(userId2);
        localStorageService.setValue(userBindKey, 'user2-value');
        // Wait for the event to fire
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBe('user2-value');

      await act(async () => {
        localStorageService.setUserId(userId);
        // Wait for the event to fire
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current).toBe('user1-value');
    });
  });
});
