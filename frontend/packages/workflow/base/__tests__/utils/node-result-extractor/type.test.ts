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

import {
  type CaseResultData,
  type NodeResultExtracted,
} from '../../../src/utils/node-result-extractor/type';
import { StandardNodeType } from '../../../src/types';

describe('node-result-extractor/type', () => {
  describe('CaseResultData', () => {
    it('应该能够创建基本的 CaseResultData 对象', () => {
      const data: CaseResultData = {
        dataList: [
          {
            title: 'test',
            data: 'test data',
          },
        ],
        imgList: ['https://example.com/image.png'],
      };

      expect(data.dataList).toHaveLength(1);
      expect(data.dataList?.[0].title).toBe('test');
      expect(data.dataList?.[0].data).toBe('test data');
      expect(data.imgList).toHaveLength(1);
      expect(data.imgList?.[0]).toBe('https://example.com/image.png');
    });

    it('应该允许所有属性为可选', () => {
      const data: CaseResultData = {};
      expect(data.dataList).toBeUndefined();
      expect(data.imgList).toBeUndefined();
    });

    it('应该允许 dataList 中的 data 为任意类型', () => {
      const data: CaseResultData = {
        dataList: [
          { title: 'string', data: 'string data' },
          { title: 'number', data: 123 },
          { title: 'boolean', data: true },
          { title: 'object', data: { key: 'value' } },
          { title: 'array', data: [1, 2, 3] },
        ],
      };

      expect(data.dataList).toHaveLength(5);
      expect(typeof data.dataList?.[0].data).toBe('string');
      expect(typeof data.dataList?.[1].data).toBe('number');
      expect(typeof data.dataList?.[2].data).toBe('boolean');
      expect(typeof data.dataList?.[3].data).toBe('object');
      expect(Array.isArray(data.dataList?.[4].data)).toBe(true);
    });
  });

  describe('NodeResultExtracted', () => {
    it('应该能够创建基本的 NodeResultExtracted 对象', () => {
      const result: NodeResultExtracted = {
        nodeId: '123',
        nodeType: StandardNodeType.LLM,
        isBatch: false,
        caseResult: [
          {
            dataList: [{ title: 'test', data: 'test data' }],
            imgList: ['https://example.com/image.png'],
          },
        ],
      };

      expect(result.nodeId).toBe('123');
      expect(result.nodeType).toBe(StandardNodeType.LLM);
      expect(result.isBatch).toBe(false);
      expect(result.caseResult).toHaveLength(1);
    });

    it('应该允许所有属性为可选', () => {
      const result: NodeResultExtracted = {};
      expect(result.nodeId).toBeUndefined();
      expect(result.nodeType).toBeUndefined();
      expect(result.isBatch).toBeUndefined();
      expect(result.caseResult).toBeUndefined();
    });

    it('应该允许 caseResult 为空数组', () => {
      const result: NodeResultExtracted = {
        nodeId: '123',
        nodeType: StandardNodeType.LLM,
        isBatch: false,
        caseResult: [],
      };

      expect(result.caseResult).toHaveLength(0);
    });

    it('应该允许多个 caseResult', () => {
      const result: NodeResultExtracted = {
        nodeId: '123',
        nodeType: StandardNodeType.LLM,
        isBatch: true,
        caseResult: [
          {
            dataList: [{ title: 'case1', data: 'data1' }],
          },
          {
            dataList: [{ title: 'case2', data: 'data2' }],
          },
        ],
      };

      expect(result.caseResult).toHaveLength(2);
      expect(result.caseResult?.[0].dataList?.[0].title).toBe('case1');
      expect(result.caseResult?.[1].dataList?.[0].title).toBe('case2');
    });
  });
});
