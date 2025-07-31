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

import { describe, it, expect, vi } from 'vitest';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { getFormValueByPathEnds } from '../../src/utils/form-helpers';

// Mock lodash-es
vi.mock('lodash-es', () => ({
  cloneDeep: vi.fn(val => {
    if (val === undefined) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(val));
  }),
}));

describe('form-helpers', () => {
  describe('getFormValueByPathEnds', () => {
    const createMockFormModel = (paths: Record<string, unknown>) => {
      const formItemPathMap = new Map<string, unknown>();
      Object.entries(paths).forEach(([path, value]) => {
        formItemPathMap.set(path, value);
      });

      return {
        formItemPathMap,
        getFormItemValueByPath: vi.fn(path => paths[path]),
      };
    };

    const createMockNode = (
      formModel: ReturnType<typeof createMockFormModel>,
    ) =>
      ({
        getData: vi.fn((dataType: symbol) => {
          if (Object.is(dataType, FlowNodeFormData)) {
            return { formModel };
          }
          return null;
        }),
        getNodeRegistry: () => ({}),
      } as unknown as FlowNodeEntity);

    it('应该返回匹配路径结尾的表单项值', () => {
      const formModel = createMockFormModel({
        '/form/test/value': 'test value',
        '/form/other/path': 'other value',
      });
      const node = createMockNode(formModel);

      const result = getFormValueByPathEnds(node, 'test/value');
      expect(result).toBe('test value');
      expect(formModel.getFormItemValueByPath).toHaveBeenCalledWith(
        '/form/test/value',
      );
    });

    it('应该在找不到匹配路径时返回 undefined', () => {
      const formModel = createMockFormModel({
        '/form/test/value': 'test value',
      });
      const node = createMockNode(formModel);

      const result = getFormValueByPathEnds(node, 'non/existent');
      expect(result).toBeUndefined();
      expect(formModel.getFormItemValueByPath).not.toHaveBeenCalled();
    });

    it('应该正确处理复杂对象值', () => {
      const complexValue = {
        name: 'test',
        value: 42,
        nested: {
          field: 'nested value',
        },
      };
      const formModel = createMockFormModel({
        '/form/complex/value': complexValue,
      });
      const node = createMockNode(formModel);

      const result = getFormValueByPathEnds(node, 'complex/value');
      expect(result).toEqual(complexValue);
      expect(formModel.getFormItemValueByPath).toHaveBeenCalledWith(
        '/form/complex/value',
      );
    });

    it('应该返回深拷贝的值而不是引用', () => {
      const originalValue = { name: 'test' };
      const formModel = createMockFormModel({
        '/form/object/value': originalValue,
      });
      const node = createMockNode(formModel);

      const result = getFormValueByPathEnds(node, 'object/value');
      expect(result).toEqual(originalValue);
      expect(result).not.toBe(originalValue);
    });

    it('应该在有多个匹配路径时返回第一个匹配的值', () => {
      const formModel = createMockFormModel({
        '/form/path/test/value': 'first value',
        '/other/path/test/value': 'second value',
      });
      const node = createMockNode(formModel);

      const result = getFormValueByPathEnds(node, 'test/value');
      expect(result).toBe('first value');
      expect(formModel.getFormItemValueByPath).toHaveBeenCalledWith(
        '/form/path/test/value',
      );
    });

    it('应该正确处理空值', () => {
      const formModel = createMockFormModel({
        '/form/empty/value': null,
        '/form/undefined/value': undefined,
      });
      const node = createMockNode(formModel);

      const nullResult = getFormValueByPathEnds(node, 'empty/value');
      expect(nullResult).toBeNull();

      const undefinedResult = getFormValueByPathEnds(node, 'undefined/value');
      expect(undefinedResult).toBeUndefined();
    });

    it('应该正确处理数组值', () => {
      const arrayValue = [1, 2, { name: 'test' }];
      const formModel = createMockFormModel({
        '/form/array/value': arrayValue,
      });
      const node = createMockNode(formModel);

      const result = getFormValueByPathEnds(node, 'array/value');
      expect(result).toEqual(arrayValue);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
