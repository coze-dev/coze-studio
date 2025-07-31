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

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { localStorageService } from '../../src/core';

const LOCAL_STORAGE_KEY = '__coz_biz_cache__';

describe('LocalStorageService', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset userId
    localStorageService.setUserId(undefined);
  });

  describe('永久存储', () => {
    const permanentKey = 'workflow-toolbar-role-onboarding-hidden';

    it('应该能正确设置和获取永久存储的值', () => {
      const value = 'test-value';

      localStorageService.setValue(permanentKey, value);
      expect(localStorageService.getValue(permanentKey)).toBe(value);
    });

    it('应该能正确删除永久存储的值', () => {
      localStorageService.setValue(permanentKey, 'test-value');
      localStorageService.setValue(permanentKey, undefined);
      expect(localStorageService.getValue(permanentKey)).toBeUndefined();
    });

    it('应该将数据持久化到 localStorage', async () => {
      const value = 'test-value';

      localStorageService.setValue(permanentKey, value);

      // Waiting for throttle
      await new Promise(resolve => setTimeout(resolve, 400));

      const storedData = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY) || '{}',
      );
      expect(storedData.permanent?.[permanentKey]).toBe(value);
    });
  });

  describe('用户相关存储', () => {
    const userId = 'test-user-id';
    const userBindKey = 'coachmark';

    beforeEach(() => {
      localStorageService.setUserId(userId);
    });

    it('应该能正确设置和获取用户相关的值', () => {
      const value = 'test-value';

      localStorageService.setValue(userBindKey, value);
      expect(localStorageService.getValue(userBindKey)).toBe(value);
    });

    it('在没有设置 userId 时不应该设置用户相关的值', () => {
      vi.stubGlobal('IS_DEV_MODE', false);
      localStorageService.setUserId(undefined);

      localStorageService.setValue(userBindKey, 'test-value');
      expect(localStorageService.getValue(userBindKey)).toBeUndefined();
    });

    it('切换用户时应该能访问对应用户的数据', () => {
      const value1 = 'user1-value';
      const value2 = 'user2-value';
      const userId2 = 'test-user-id-2';

      // The first user's data
      localStorageService.setValue(userBindKey, value1);

      // Switch to the second user
      localStorageService.setUserId(userId2);
      localStorageService.setValue(userBindKey, value2);
      expect(localStorageService.getValue(userBindKey)).toBe(value2);

      // Switch back to the first user
      localStorageService.setUserId(userId);
      expect(localStorageService.getValue(userBindKey)).toBe(value1);
    });
  });

  describe('事件监听', () => {
    const permanentKey = 'workflow-toolbar-role-onboarding-hidden';

    it('值变化时应该触发 change 事件', async () => {
      const value = 'test-value';
      const changeHandler = vi.fn();

      localStorageService.on('change', changeHandler);
      localStorageService.setValue(permanentKey, value);

      // Wait for the event to fire
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(changeHandler).toHaveBeenCalled();

      localStorageService.off('change', changeHandler);
    });

    it('设置 userId 时应该触发 setUserId 事件', () => {
      const userId = 'test-user-id';
      const setUserIdHandler = vi.fn();

      localStorageService.on('setUserId', setUserIdHandler);
      localStorageService.setUserId(userId);

      expect(setUserIdHandler).toHaveBeenCalledWith(userId);

      localStorageService.off('setUserId', setUserIdHandler);
    });
  });

  describe('异步获取值', () => {
    const permanentKey = 'workflow-toolbar-role-onboarding-hidden';

    it('对于非用户绑定的值应该直接返回', async () => {
      const value = 'test-value';

      localStorageService.setValue(permanentKey, value);
      const result = await localStorageService.getValueSync(permanentKey);
      expect(result).toBe(value);
    }, 10000);

    it('对于用户绑定的值，应该等待 userId 设置后再返回', async () => {
      const userId = 'test-user-id';
      const value = 'test-value';

      // Set the value first
      localStorageService.setUserId(userId);
      localStorageService.setValue('coachmark', value);
      localStorageService.setUserId(undefined);

      // Get value asynchronously
      const valuePromise = localStorageService.getValueSync('coachmark');

      // Set userId
      setTimeout(() => {
        localStorageService.setUserId(userId);
      }, 0);

      const result = await valuePromise;
      expect(result).toBe(value);
    });
  });
});
