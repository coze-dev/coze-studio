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

import { describe, it, expect } from 'vitest';

import { paseLocalStorageValue, filterCacheData } from '../../src/utils/parse';
import { type LocalStorageCacheData } from '../../src/types';

describe('解析工具函数', () => {
  describe('paseLocalStorageValue', () => {
    it('应该返回空对象当输入为 null', () => {
      expect(paseLocalStorageValue(null)).toEqual({});
    });

    it('应该返回空对象当输入不是有效的 JSON', () => {
      expect(paseLocalStorageValue('invalid json')).toEqual({});
    });

    it('应该返回空对象当输入的 JSON 不符合缓存数据格式', () => {
      expect(paseLocalStorageValue('{"invalid": "data"}')).toEqual({
        invalid: 'data',
      });
    });

    it('应该正确解析永久缓存数据', () => {
      const data = {
        permanent: {
          'workspace-spaceId': 'test-space-id',
        },
      };
      expect(paseLocalStorageValue(JSON.stringify(data))).toEqual(data);
    });

    it('应该正确解析用户相关缓存数据', () => {
      const data = {
        userRelated: {
          'user-1': {
            'workspace-spaceId': 'test-space-id',
          },
        },
      };
      expect(paseLocalStorageValue(JSON.stringify(data))).toEqual(data);
    });

    it('应该正确解析同时包含永久和用户相关的缓存数据', () => {
      const data = {
        permanent: {
          'workspace-spaceId': 'test-space-id',
        },
        userRelated: {
          'user-1': {
            'workspace-subMenu': 'test-menu',
          },
        },
      };
      expect(paseLocalStorageValue(JSON.stringify(data))).toEqual(data);
    });

    it('应该返回空对象当永久缓存数据格式无效', () => {
      const data = {
        permanent: {
          key: 123, // Should be string.
        },
      };
      expect(paseLocalStorageValue(JSON.stringify(data))).toEqual({});
    });

    it('应该返回空对象当用户相关缓存数据格式无效', () => {
      const data = {
        userRelated: {
          'user-1': {
            key: 123, // Should be string.
          },
        },
      };
      expect(paseLocalStorageValue(JSON.stringify(data))).toEqual({});
    });
  });

  describe('filterCacheData', () => {
    it('应该过滤掉永久缓存中的无效键', () => {
      const data: LocalStorageCacheData = {
        permanent: {
          'workspace-spaceId': 'valid-value',
          'invalid-key': 'invalid-value',
        },
      };

      const filtered = filterCacheData(data);
      expect(filtered.permanent?.['workspace-spaceId']).toBe('valid-value');
      expect(filtered.permanent?.['invalid-key']).toBeUndefined();
    });

    it('应该过滤掉用户相关缓存中的无效键', () => {
      const data: LocalStorageCacheData = {
        userRelated: {
          'user-1': {
            'workspace-spaceId': 'valid-value',
            'invalid-key': 'invalid-value',
          },
        },
      };

      const filtered = filterCacheData(data);
      expect(filtered.userRelated?.['user-1']?.['workspace-spaceId']).toBe(
        'valid-value',
      );
      expect(filtered.userRelated?.['user-1']?.['invalid-key']).toBeUndefined();
    });

    it('应该保持用户 ID 不变', () => {
      const data: LocalStorageCacheData = {
        userRelated: {
          'user-1': {
            'workspace-spaceId': 'value-1',
          },
          'user-2': {
            'workspace-spaceId': 'value-2',
          },
        },
      };

      const filtered = filterCacheData(data);
      expect(Object.keys(filtered.userRelated || {})).toEqual([
        'user-1',
        'user-2',
      ]);
    });
  });
});
