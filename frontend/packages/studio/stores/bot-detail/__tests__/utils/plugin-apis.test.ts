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
import type { PluginApi } from '@coze-arch/bot-api/playground_api';

import {
  getPluginApisFilterExample,
  getSinglePluginApiFilterExample,
} from '../../src/utils/plugin-apis';

describe('plugin-apis', () => {
  describe('getPluginApisFilterExample', () => {
    it('应该过滤掉所有插件API中的debug_example字段', () => {
      // Use as unknown as PluginApi [] to bypass type checking
      const mockPluginApis = [
        {
          name: 'plugin1',
          debug_example: 'example1',
          parameters: [],
        },
        {
          name: 'plugin2',
          debug_example: 'example2',
          parameters: [],
        },
      ] as unknown as PluginApi[];

      const result = getPluginApisFilterExample(mockPluginApis);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('debug_example');
      expect(result[1]).not.toHaveProperty('debug_example');
      expect(result[0].name).toBe('plugin1');
      expect(result[1].name).toBe('plugin2');
    });

    it('应该处理空数组', () => {
      const result = getPluginApisFilterExample([]);
      expect(result).toEqual([]);
    });
  });

  describe('getSinglePluginApiFilterExample', () => {
    it('应该过滤掉单个插件API中的debug_example字段', () => {
      // Use as unknown as PluginApi to bypass type checking
      const mockPluginApi = {
        name: 'plugin1',
        debug_example: 'example1',
        parameters: [],
      } as unknown as PluginApi;

      const result = getSinglePluginApiFilterExample(mockPluginApi);

      expect(result).not.toHaveProperty('debug_example');
      expect(result.name).toBe('plugin1');
    });
  });
});
