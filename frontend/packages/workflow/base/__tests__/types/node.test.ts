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

import { StandardNodeType } from '../../src/types/node-type';
import type { WorkflowNodeJSON, WorkflowJSON } from '../../src/types/node';

describe('node types', () => {
  describe('WorkflowNodeJSON', () => {
    it('应该能够创建基本的节点 JSON', () => {
      const node: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.Start,
        data: {},
      };

      expect(node).toEqual({
        id: '1',
        type: StandardNodeType.Start,
        data: {},
      });
    });

    it('应该能够创建带有元数据的节点 JSON', () => {
      const node: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.Start,
        meta: {
          position: { x: 100, y: 100 },
        },
        data: {},
      };

      expect(node.meta).toBeDefined();
      expect(node.meta?.position).toEqual({ x: 100, y: 100 });
    });

    it('应该能够创建带有版本的节点 JSON', () => {
      const node: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.Start,
        data: {},
        version: '1.0.0',
      };

      expect(node.version).toBe('1.0.0');
    });

    it('应该能够创建带有子节点的节点 JSON', () => {
      const node: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.Start,
        data: {},
        blocks: [
          {
            id: '2',
            type: StandardNodeType.Code,
            data: {},
          },
        ],
      };

      expect(node.blocks).toHaveLength(1);
      expect(node.blocks?.[0].type).toBe(StandardNodeType.Code);
    });

    it('应该能够创建带有边的节点 JSON', () => {
      const node: WorkflowNodeJSON = {
        id: '1',
        type: StandardNodeType.Start,
        data: {},
        edges: [
          {
            sourceNodeID: '1',
            targetNodeID: '2',
          },
        ],
      };

      expect(node.edges).toHaveLength(1);
      expect(node.edges?.[0].sourceNodeID).toBe('1');
      expect(node.edges?.[0].targetNodeID).toBe('2');
    });

    it('应该能够使用泛型数据类型', () => {
      interface CustomData {
        name: string;
        value: number;
      }

      const node: WorkflowNodeJSON<CustomData> = {
        id: '1',
        type: StandardNodeType.Start,
        data: {
          name: 'test',
          value: 42,
        },
      };

      expect(node.data.name).toBe('test');
      expect(node.data.value).toBe(42);
    });
  });

  describe('WorkflowJSON', () => {
    it('应该能够创建基本的工作流 JSON', () => {
      const workflow: WorkflowJSON = {
        nodes: [],
        edges: [],
      };

      expect(workflow.nodes).toEqual([]);
      expect(workflow.edges).toEqual([]);
    });

    it('应该能够创建包含节点和边的工作流 JSON', () => {
      const workflow: WorkflowJSON = {
        nodes: [
          {
            id: '1',
            type: StandardNodeType.Start,
            data: {},
          },
          {
            id: '2',
            type: StandardNodeType.End,
            data: {},
          },
        ],
        edges: [
          {
            sourceNodeID: '1',
            targetNodeID: '2',
          },
        ],
      };

      expect(workflow.nodes).toHaveLength(2);
      expect(workflow.edges).toHaveLength(1);
      expect(workflow.nodes[0].type).toBe(StandardNodeType.Start);
      expect(workflow.nodes[1].type).toBe(StandardNodeType.End);
      expect(workflow.edges[0].sourceNodeID).toBe('1');
      expect(workflow.edges[0].targetNodeID).toBe('2');
    });
  });
});
