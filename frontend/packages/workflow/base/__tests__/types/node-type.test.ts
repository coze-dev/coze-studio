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
  StandardNodeType,
  NODE_ORDER,
  CONVERSATION_NODES,
} from '../../src/types/node-type';

describe('node-type', () => {
  describe('StandardNodeType', () => {
    it('应该包含所有预定义的节点类型', () => {
      // Test some key node types
      expect(StandardNodeType.Start).toBe('1');
      expect(StandardNodeType.End).toBe('2');
      expect(StandardNodeType.LLM).toBe('3');
      expect(StandardNodeType.Api).toBe('4');
      expect(StandardNodeType.Code).toBe('5');
      expect(StandardNodeType.Dataset).toBe('6');
      expect(StandardNodeType.If).toBe('8');
      expect(StandardNodeType.SubWorkflow).toBe('9');
      expect(StandardNodeType.Variable).toBe('11');
      expect(StandardNodeType.Database).toBe('12');
      expect(StandardNodeType.Output).toBe('13');
      expect(StandardNodeType.Http).toBe('45');
    });

    it('应该不包含已废弃的节点类型', () => {
      const nodeTypeValues = Object.values(StandardNodeType);
      expect(nodeTypeValues).not.toContain('33'); // TriggerCreate
    });
  });

  describe('NODE_ORDER', () => {
    it('应该为每个节点类型定义正确的顺序', () => {
      expect(NODE_ORDER[StandardNodeType.Start]).toBe(1);
      expect(NODE_ORDER[StandardNodeType.End]).toBe(2);
      expect(NODE_ORDER[StandardNodeType.Api]).toBe(3);
      expect(NODE_ORDER[StandardNodeType.LLM]).toBe(4);
      expect(NODE_ORDER[StandardNodeType.Code]).toBe(5);
      expect(NODE_ORDER[StandardNodeType.Dataset]).toBe(6);
      expect(NODE_ORDER[StandardNodeType.SubWorkflow]).toBe(7);
      expect(NODE_ORDER[StandardNodeType.Imageflow]).toBe(8);
      expect(NODE_ORDER[StandardNodeType.If]).toBe(9);
      expect(NODE_ORDER[StandardNodeType.Loop]).toBe(10);
    });

    it('应该不包含已废弃节点类型的顺序', () => {
      expect(NODE_ORDER).not.toHaveProperty('33'); // TriggerCreate
    });

    it('应该为所有需要排序的节点类型定义顺序', () => {
      const nodeTypesWithOrder = Object.keys(NODE_ORDER);
      const expectedNodeTypes = [
        StandardNodeType.Start,
        StandardNodeType.End,
        StandardNodeType.Api,
        StandardNodeType.LLM,
        StandardNodeType.Code,
        StandardNodeType.Dataset,
        StandardNodeType.SubWorkflow,
        StandardNodeType.Imageflow,
        StandardNodeType.If,
        StandardNodeType.Loop,
        StandardNodeType.Intent,
        StandardNodeType.Text,
        StandardNodeType.Output,
        StandardNodeType.Question,
        StandardNodeType.Variable,
        StandardNodeType.Database,
        StandardNodeType.LTM,
        StandardNodeType.Batch,
        StandardNodeType.Input,
        StandardNodeType.SetVariable,
        StandardNodeType.Break,
        StandardNodeType.Continue,
        StandardNodeType.SceneChat,
        StandardNodeType.SceneVariable,
        StandardNodeType.TriggerUpsert,
        StandardNodeType.TriggerRead,
        StandardNodeType.TriggerDelete,
      ];

      expectedNodeTypes.forEach(nodeType => {
        expect(nodeTypesWithOrder).toContain(nodeType);
        expect(NODE_ORDER[nodeType]).toBeGreaterThan(0);
      });
    });
  });

  describe('CONVERSATION_NODES', () => {
    it('应该包含所有会话相关的节点类型', () => {
      expect(CONVERSATION_NODES).toEqual([
        StandardNodeType.CreateConversation,
        StandardNodeType.UpdateConversation,
        StandardNodeType.DeleteConversation,
        StandardNodeType.QueryConversationList,
      ]);
    });

    it('应该只包含会话相关的节点类型', () => {
      CONVERSATION_NODES.forEach(nodeType => {
        expect([
          StandardNodeType.CreateConversation,
          StandardNodeType.UpdateConversation,
          StandardNodeType.DeleteConversation,
          StandardNodeType.QueryConversationList,
        ]).toContain(nodeType);
      });
    });

    it('应该是一个数组', () => {
      expect(Array.isArray(CONVERSATION_NODES)).toBe(true);
    });
  });
});
