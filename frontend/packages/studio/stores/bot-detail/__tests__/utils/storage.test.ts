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

import { createStorage, storage } from '../../src/utils/storage';
import { useCollaborationStore } from '../../src/store/collaboration';

// Analog useCollaborationStore
vi.mock('../../src/store/collaboration', () => ({
  useCollaborationStore: {
    getState: vi.fn().mockReturnValue({
      getBaseVersion: vi.fn().mockReturnValue('mock-base-version'),
    }),
  },
}));

describe('storage utils', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    // Create a simulated Storage object
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };

    vi.clearAllMocks();
  });

  describe('createStorage', () => {
    it('应该创建一个代理对象，可以设置、获取和删除值', () => {
      const target: Record<string, any> = {};
      const prefix = 'test_prefix';
      const proxy = createStorage<Record<string, any>>(
        mockStorage,
        target,
        prefix,
      );

      // test settings
      proxy.testKey = 'testValue';
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `${prefix}.testKey`,
        'testValue',
      );

      // Test Get Value
      (mockStorage.getItem as any).mockReturnValueOnce('storedValue');
      expect(proxy.testKey).toBe('storedValue');
      expect(mockStorage.getItem).toHaveBeenCalledWith(`${prefix}.testKey`);

      // Test Delete Value
      delete proxy.testKey;
      expect(mockStorage.removeItem).toHaveBeenCalledWith(`${prefix}.testKey`);
    });

    it('只能设置字符串值', () => {
      const target: Record<string, any> = {};
      const proxy = createStorage<Record<string, any>>(mockStorage, target);

      // Setting string value should succeed
      proxy.key1 = 'value1';
      expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

      // Note: In actual code, setting a non-string value will return false, but no error will be thrown
      // In the test, we only verify that setItem is not called again
      try {
        // Errors may be thrown here, but we don't care about the errors themselves
        proxy.key2 = 123 as any;
        // If no error is thrown, we expect that setItem will not be called again
      } catch (e) {
        // If an error is thrown, we also expect that setItem will not be called again
        console.log('捕获到错误，但这是预期的行为');
      }

      // Whether an error is thrown or not, we expect that setItem will not be called again
      expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('获取不存在的值应该返回 undefined', () => {
      const target: Record<string, any> = {};
      const proxy = createStorage<Record<string, any>>(mockStorage, target);

      (mockStorage.getItem as any).mockReturnValueOnce(null);
      expect(proxy.nonExistentKey).toBeUndefined();
    });
  });

  describe('storage', () => {
    it('获取 baseVersion 应该从 useCollaborationStore 获取', () => {
      const version = storage.baseVersion;

      expect(version).toBe('mock-base-version');
      expect(useCollaborationStore.getState).toHaveBeenCalled();
    });

    it('设置 baseVersion 应该打印错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        /* empty function */
      });

      // Note: In the actual code, setting baseVersion will return false and print an error, but no error will be thrown
      // In testing, we only verify that console.error is called
      try {
        // Errors may be thrown here, but we don't care about the errors themselves
        storage.baseVersion = 'new-version';
        // If no error is thrown, we expect console.error to be called
      } catch (e) {
        // If an error is thrown, we also expect console.error to be called
        console.log('捕获到错误，但这是预期的行为');
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
