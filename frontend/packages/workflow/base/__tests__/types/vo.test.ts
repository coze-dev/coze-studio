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
  ValueExpressionType,
  ValueExpression,
  type RefExpressionContent,
  type LiteralExpression,
  type RefExpression,
  type InputValueVO,
  type InputTypeValueVO,
  BatchMode,
  type BatchVOInputList,
  type BatchVO,
  type OutputValueVO,
} from '../../src/types/vo';
import { ViewVariableType } from '../../src/types/view-variable-type';

describe('vo', () => {
  describe('RefExpressionContent', () => {
    it('应该能够创建引用表达式内容', () => {
      const content: RefExpressionContent = {
        keyPath: ['node1', 'output1'],
      };

      expect(content.keyPath).toEqual(['node1', 'output1']);
    });
  });

  describe('ValueExpressionType', () => {
    it('应该定义正确的表达式类型', () => {
      expect(ValueExpressionType.LITERAL).toBe('literal');
      expect(ValueExpressionType.REF).toBe('ref');
    });
  });

  describe('LiteralExpression', () => {
    it('应该能够创建字符串字面量表达式', () => {
      const expr: LiteralExpression = {
        type: ValueExpressionType.LITERAL,
        content: 'test string',
      };

      expect(expr.type).toBe(ValueExpressionType.LITERAL);
      expect(expr.content).toBe('test string');
    });

    it('应该能够创建数字字面量表达式', () => {
      const expr: LiteralExpression = {
        type: ValueExpressionType.LITERAL,
        content: 42,
      };

      expect(expr.content).toBe(42);
    });

    it('应该能够创建布尔字面量表达式', () => {
      const expr: LiteralExpression = {
        type: ValueExpressionType.LITERAL,
        content: true,
      };

      expect(expr.content).toBe(true);
    });

    it('应该能够创建数组字面量表达式', () => {
      const expr: LiteralExpression = {
        type: ValueExpressionType.LITERAL,
        content: [1, 'two', true],
      };

      expect(expr.content).toEqual([1, 'two', true]);
    });

    it('应该能够包含原始元数据', () => {
      const expr: LiteralExpression = {
        type: ValueExpressionType.LITERAL,
        content: 'test',
        rawMeta: {
          source: 'user input',
          timestamp: 123456789,
        },
      };

      expect(expr.rawMeta).toEqual({
        source: 'user input',
        timestamp: 123456789,
      });
    });
  });

  describe('RefExpression', () => {
    it('应该能够创建引用表达式', () => {
      const expr: RefExpression = {
        type: ValueExpressionType.REF,
        content: {
          keyPath: ['node1', 'output1'],
        },
      };

      expect(expr.type).toBe(ValueExpressionType.REF);
      expect(expr.content?.keyPath).toEqual(['node1', 'output1']);
    });

    it('应该允许内容为可选', () => {
      const expr: RefExpression = {
        type: ValueExpressionType.REF,
      };

      expect(expr.content).toBeUndefined();
    });
  });

  describe('ValueExpression 命名空间函数', () => {
    describe('isRef', () => {
      it('应该正确识别引用表达式', () => {
        const refExpr: ValueExpression = {
          type: ValueExpressionType.REF,
          content: { keyPath: ['node1', 'output1'] },
        };
        const literalExpr: ValueExpression = {
          type: ValueExpressionType.LITERAL,
          content: 'test',
        };

        expect(ValueExpression.isRef(refExpr)).toBe(true);
        expect(ValueExpression.isRef(literalExpr)).toBe(false);
      });
    });

    describe('isLiteral', () => {
      it('应该正确识别字面量表达式', () => {
        const refExpr: ValueExpression = {
          type: ValueExpressionType.REF,
          content: { keyPath: ['node1', 'output1'] },
        };
        const literalExpr: ValueExpression = {
          type: ValueExpressionType.LITERAL,
          content: 'test',
        };

        expect(ValueExpression.isLiteral(literalExpr)).toBe(true);
        expect(ValueExpression.isLiteral(refExpr)).toBe(false);
      });
    });

    describe('isExpression', () => {
      it('应该正确识别有效的表达式', () => {
        const refExpr: ValueExpression = {
          type: ValueExpressionType.REF,
          content: { keyPath: ['node1', 'output1'] },
        };
        const literalExpr: ValueExpression = {
          type: ValueExpressionType.LITERAL,
          content: 'test',
        };

        expect(ValueExpression.isExpression(refExpr)).toBe(true);
        expect(ValueExpression.isExpression(literalExpr)).toBe(true);
        expect(ValueExpression.isExpression(undefined)).toBe(false);
      });
    });

    describe('isEmpty', () => {
      it('应该正确识别空的字面量表达式', () => {
        expect(
          ValueExpression.isEmpty({
            type: ValueExpressionType.LITERAL,
            content: '',
          }),
        ).toBe(true);
        expect(
          ValueExpression.isEmpty({
            type: ValueExpressionType.LITERAL,
            content: undefined,
          }),
        ).toBe(true);
        expect(
          ValueExpression.isEmpty({
            type: ValueExpressionType.LITERAL,
            content: 'test',
          }),
        ).toBe(false);
        expect(
          ValueExpression.isEmpty({
            type: ValueExpressionType.LITERAL,
            content: false,
          }),
        ).toBe(false);
      });

      it('应该正确识别空的引用表达式', () => {
        expect(
          ValueExpression.isEmpty({
            type: ValueExpressionType.REF,
            content: { keyPath: [] },
          }),
        ).toBe(true);
        expect(
          ValueExpression.isEmpty({
            type: ValueExpressionType.REF,
            content: { keyPath: ['node1'] },
          }),
        ).toBe(false);
      });

      it('应该正确处理 undefined 值', () => {
        expect(ValueExpression.isEmpty(undefined)).toBe(true);
      });
    });
  });

  describe('InputValueVO', () => {
    it('应该能够创建输入值对象', () => {
      const vo: InputValueVO = {
        name: 'test input',
        input: {
          type: ValueExpressionType.LITERAL,
          content: 'test value',
        },
      };

      expect(vo.name).toBe('test input');
      expect(vo.input.type).toBe(ValueExpressionType.LITERAL);
      expect(vo.input.content).toBe('test value');
    });

    it('应该允许名称为可选', () => {
      const vo: InputValueVO = {
        input: {
          type: ValueExpressionType.LITERAL,
          content: 'test value',
        },
      };

      expect(vo.name).toBeUndefined();
    });
  });

  describe('InputTypeValueVO', () => {
    it('应该能够创建带类型的输入值对象', () => {
      const vo: InputTypeValueVO = {
        name: 'test input',
        type: ViewVariableType.String,
        input: {
          type: ValueExpressionType.LITERAL,
          content: 'test value',
        },
      };

      expect(vo.name).toBe('test input');
      expect(vo.type).toBe(ViewVariableType.String);
      expect(vo.input.type).toBe(ValueExpressionType.LITERAL);
    });
  });

  describe('BatchMode', () => {
    it('应该定义正确的批处理模式', () => {
      expect(BatchMode.Single).toBe('single');
      expect(BatchMode.Batch).toBe('batch');
    });
  });

  describe('BatchVOInputList', () => {
    it('应该能够创建批处理输入列表项', () => {
      const inputList: BatchVOInputList = {
        id: '1',
        name: 'test batch input',
        input: {
          type: ValueExpressionType.REF,
          content: { keyPath: ['node1', 'output1'] },
        },
      };

      expect(inputList.id).toBe('1');
      expect(inputList.name).toBe('test batch input');
      expect(inputList.input.type).toBe(ValueExpressionType.REF);
    });
  });

  describe('BatchVO', () => {
    it('应该能够创建批处理配置对象', () => {
      const vo: BatchVO = {
        batchSize: 10,
        concurrentSize: 2,
        inputLists: [
          {
            id: '1',
            name: 'input1',
            input: {
              type: ValueExpressionType.REF,
              content: { keyPath: ['node1', 'output1'] },
            },
          },
        ],
      };

      expect(vo.batchSize).toBe(10);
      expect(vo.concurrentSize).toBe(2);
      expect(vo.inputLists).toHaveLength(1);
      expect(vo.inputLists[0].id).toBe('1');
    });
  });

  describe('OutputValueVO', () => {
    it('应该能够创建基本的输出值对象', () => {
      const vo: OutputValueVO = {
        key: 'output1',
        name: 'Output 1',
        type: ViewVariableType.String,
      };

      expect(vo.key).toBe('output1');
      expect(vo.name).toBe('Output 1');
      expect(vo.type).toBe(ViewVariableType.String);
    });

    it('应该能够创建带可选属性的输出值对象', () => {
      const vo: OutputValueVO = {
        key: 'output1',
        name: 'Output 1',
        type: ViewVariableType.String,
        description: 'Test output',
        readonly: true,
        required: true,
      };

      expect(vo.description).toBe('Test output');
      expect(vo.readonly).toBe(true);
      expect(vo.required).toBe(true);
    });

    it('应该能够创建带子节点的输出值对象', () => {
      const vo: OutputValueVO = {
        key: 'parent',
        name: 'Parent Output',
        type: ViewVariableType.Object,
        children: [
          {
            key: 'child1',
            name: 'Child 1',
            type: ViewVariableType.String,
          },
          {
            key: 'child2',
            name: 'Child 2',
            type: ViewVariableType.Number,
          },
        ],
      };

      expect(vo.children).toHaveLength(2);
      expect(vo.children?.[0].key).toBe('child1');
      expect(vo.children?.[1].type).toBe(ViewVariableType.Number);
    });
  });
});
