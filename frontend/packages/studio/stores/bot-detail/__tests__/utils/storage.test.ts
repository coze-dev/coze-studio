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

// 模拟 useCollaborationStore
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
    // 创建模拟的 Storage 对象
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

      // 测试设置值
      proxy.testKey = 'testValue';
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        `${prefix}.testKey`,
        'testValue',
      );

      // 测试获取值
      (mockStorage.getItem as any).mockReturnValueOnce('storedValue');
      expect(proxy.testKey).toBe('storedValue');
      expect(mockStorage.getItem).toHaveBeenCalledWith(`${prefix}.testKey`);

      // 测试删除值
      delete proxy.testKey;
      expect(mockStorage.removeItem).toHaveBeenCalledWith(`${prefix}.testKey`);
    });

    it('只能设置字符串值', () => {
      const target: Record<string, any> = {};
      const proxy = createStorage<Record<string, any>>(mockStorage, target);

      // 设置字符串值应该成功
      proxy.key1 = 'value1';
      expect(mockStorage.setItem).toHaveBeenCalledTimes(1);

      // 注意：在实际代码中，设置非字符串值会返回 false，但不会抛出错误
      // 在测试中，我们只验证 setItem 没有被再次调用
      try {
        // 这里可能会抛出错误，但我们不关心错误本身
        proxy.key2 = 123 as any;
        // 如果没有抛出错误，我们期望 setItem 不会被再次调用
      } catch (e) {
        // 如果抛出错误，我们也期望 setItem 不会被再次调用
        console.log('捕获到错误，但这是预期的行为');
      }

      // 无论是否抛出错误，我们都期望 setItem 不会被再次调用
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
        /* 空函数 */
      });

      // 注意：在实际代码中，设置 baseVersion 会返回 false 并打印错误，但不会抛出错误
      // 在测试中，我们只验证 console.error 被调用
      try {
        // 这里可能会抛出错误，但我们不关心错误本身
        storage.baseVersion = 'new-version';
        // 如果没有抛出错误，我们期望 console.error 被调用
      } catch (e) {
        // 如果抛出错误，我们也期望 console.error 被调用
        console.log('捕获到错误，但这是预期的行为');
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
