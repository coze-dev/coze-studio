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

import { defaultParser } from '../../../../src/utils/node-result-extractor/parsers';
import { StandardNodeType } from '../../../../src/types';
import type { WorkflowJSON } from '../../../../src/types';
import { TerminatePlanType } from '../../../../src/api';
import type { NodeResult } from '../../../../src/api';

// Mock @coze-arch/bot-utils
vi.mock('@coze-arch/bot-utils', () => ({
  typeSafeJSONParse: (str: string) => {
    try {
      const result = JSON.parse(str);
      // If it is batch data, make sure to return an array type
      if (str === 'invalid json') {
        return str;
      }
      // If it is batch data, make sure to return an array type
      if (str.includes('batch')) {
        return Array.isArray(result) ? result : [];
      }
      return result;
    } catch {
      // If it is batch data, return an empty array
      if (str.includes('batch')) {
        return [];
      }
      return str;
    }
  },
}));

// Mock parseImagesFromOutputData
vi.mock('../../../../src/utils/output-image-parser', () => ({
  parseImagesFromOutputData: vi.fn(({ outputData }) => {
    if (typeof outputData === 'string' && outputData.includes('image')) {
      return ['https://example.com/image.png'];
    }
    if (typeof outputData === 'object' && outputData !== null) {
      const str = JSON.stringify(outputData);
      if (str.includes('image')) {
        return ['https://example.com/image.png'];
      }
    }
    return [];
  }),
}));

vi.mock('../../../../src/api', () => ({
  TerminatePlanType: {
    USESETTING: 2,
  },
}));

describe('default-parser', () => {
  const createMockNodeResult = (
    nodeId: string,
    overrides: Partial<NodeResult> = {},
  ): NodeResult => ({
    nodeId,
    isBatch: false,
    input: 'test input',
    output: 'test output',
    raw_output: 'test raw output',
    extra: '{}',
    items: '[]',
    ...overrides,
  });

  const createMockWorkflowSchema = (
    nodeId: string,
    nodeType = StandardNodeType.LLM,
  ): WorkflowJSON => ({
    nodes: [
      {
        id: nodeId,
        type: nodeType,
        data: {},
      },
    ],
    edges: [],
  });

  describe('非批处理节点', () => {
    it('应该正确解析 LLM 节点结果', () => {
      const nodeResult = createMockNodeResult('1');
      const workflowSchema = createMockWorkflowSchema(
        '1',
        StandardNodeType.LLM,
      );
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.nodeId).toBe('1');
      expect(result.nodeType).toBe(StandardNodeType.LLM);
      expect(result.isBatch).toBe(false);
      expect(result.caseResult).toHaveLength(1);
      expect(result.caseResult?.[0].dataList).toHaveLength(3); // Input, original output, final output
    });

    it('应该正确解析 Code 节点结果', () => {
      const nodeResult = createMockNodeResult('1');
      const workflowSchema = createMockWorkflowSchema(
        '1',
        StandardNodeType.Code,
      );
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.nodeType).toBe(StandardNodeType.Code);
      expect(result.caseResult?.[0].dataList).toHaveLength(3); // Input, original output, final output
    });

    it('应该正确解析 Start 节点结果', () => {
      const nodeResult = createMockNodeResult('1');
      const workflowSchema = createMockWorkflowSchema(
        '1',
        StandardNodeType.Start,
      );
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.nodeType).toBe(StandardNodeType.Start);
      expect(result.caseResult?.[0].dataList).toHaveLength(1); // input only
    });

    it('应该正确解析 End 节点结果', () => {
      const nodeResult = createMockNodeResult('1', {
        extra: JSON.stringify({
          response_extra: {
            terminal_plan: TerminatePlanType.USESETTING,
          },
        }),
        output: JSON.stringify({ content: 'test content' }),
        raw_output: JSON.stringify({ content: 'test raw content' }),
      });
      const workflowSchema = createMockWorkflowSchema(
        '1',
        StandardNodeType.End,
      );
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.nodeType).toBe(StandardNodeType.End);
      expect(result.caseResult?.[0].dataList).toHaveLength(2); // Output variables, answer content
    });

    it('应该正确解析 Message 节点结果', () => {
      const nodeResult = createMockNodeResult('1');
      const workflowSchema = createMockWorkflowSchema(
        '1',
        StandardNodeType.Output,
      );
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.nodeType).toBe(StandardNodeType.Output);
      expect(result.caseResult?.[0].dataList).toHaveLength(2); // Output variables, answer content
    });

    it('应该正确解析包含图片的输出', () => {
      const nodeResult = createMockNodeResult('1', {
        output: JSON.stringify({ content: 'test output with image' }),
      });
      const workflowSchema = createMockWorkflowSchema('1');
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.caseResult?.[0].imgList).toEqual([
        'https://example.com/image.png',
      ]);
    });
  });

  describe('批处理节点', () => {
    it('应该正确解析批处理节点结果', () => {
      const nodeResult = createMockNodeResult('1', {
        isBatch: true,
        batch: JSON.stringify([
          createMockNodeResult('1'),
          createMockNodeResult('1'),
        ]),
      });
      const workflowSchema = createMockWorkflowSchema('1');
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.isBatch).toBe(true);
      expect(result.caseResult).toHaveLength(2);
      expect(result.caseResult?.[0].dataList).toBeDefined();
      expect(result.caseResult?.[1].dataList).toBeDefined();
    });

    it('应该正确处理空的批处理结果', () => {
      const nodeResult = createMockNodeResult('1', {
        isBatch: true,
        batch: '[]',
      });
      const workflowSchema = createMockWorkflowSchema('1');
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.isBatch).toBe(true);
      expect(result.caseResult).toEqual([]);
    });

    it('应该正确处理无效的批处理 JSON', () => {
      const nodeResult = createMockNodeResult('1', {
        isBatch: true,
        batch: 'invalid batch json',
      });
      const workflowSchema = createMockWorkflowSchema('1');
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.isBatch).toBe(true);
      expect(result.caseResult).toEqual([]);
    });

    it('应该正确处理批处理中的 null 或 undefined 结果', () => {
      const nodeResult = createMockNodeResult('1', {
        isBatch: true,
        batch: JSON.stringify([null, createMockNodeResult('1'), undefined]),
      });
      const workflowSchema = createMockWorkflowSchema('1');
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.isBatch).toBe(true);
      expect(result.caseResult).toHaveLength(1);
    });
  });

  describe('特殊情况处理', () => {
    it('应该正确处理无效的 JSON 输入', () => {
      const nodeResult = createMockNodeResult('1', {
        input: 'invalid json',
        output: 'invalid json',
        raw_output: 'invalid json',
      });
      const workflowSchema = createMockWorkflowSchema('1');
      const result = defaultParser(nodeResult, workflowSchema);

      expect(
        result.caseResult?.[0].dataList?.some(
          item => item.data === 'invalid json',
        ),
      ).toBe(true);
    });

    it('应该正确处理 Text 节点的原始输出', () => {
      const nodeResult = createMockNodeResult('1', {
        raw_output: '{"key": "value"}', // Even valid JSON strings should remain intact
      });
      const workflowSchema = createMockWorkflowSchema(
        '1',
        StandardNodeType.Text,
      );
      const result = defaultParser(nodeResult, workflowSchema);

      const rawOutput = result.caseResult?.[0].dataList?.find(
        item => item.title === '原始输出',
      );
      expect(rawOutput?.data).toBe('{"key": "value"}');
    });

    it('应该正确处理不存在的节点类型', () => {
      const nodeResult = createMockNodeResult('1');
      const workflowSchema = createMockWorkflowSchema('2'); // Different node IDs
      const result = defaultParser(nodeResult, workflowSchema);

      expect(result.nodeType).toBeUndefined();
      expect(result.caseResult).toBeDefined();
    });
  });
});
