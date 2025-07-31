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

import { ViewVariableType } from '../../src/types/view-variable-type';
import {
  ViewVariableTreeNode,
  type ViewVariableMeta,
} from '../../src/types/view-variable-tree';

describe('view-variable-tree', () => {
  describe('ViewVariableTreeNode 类型', () => {
    it('应该能够创建基本的变量树节点', () => {
      const node: ViewVariableTreeNode = {
        key: 'test',
        type: ViewVariableType.String,
        name: 'Test Node',
      };

      expect(node.key).toBe('test');
      expect(node.type).toBe(ViewVariableType.String);
      expect(node.name).toBe('Test Node');
    });

    it('应该能够创建带有可选属性的变量树节点', () => {
      const node: ViewVariableTreeNode = {
        key: 'test',
        type: ViewVariableType.String,
        name: 'Test Node',
        required: true,
        description: 'Test Description',
        isPreset: true,
        enabled: true,
        label: 'Custom Label',
        defaultValue: 'default',
      };

      expect(node.required).toBe(true);
      expect(node.description).toBe('Test Description');
      expect(node.isPreset).toBe(true);
      expect(node.enabled).toBe(true);
      expect(node.label).toBe('Custom Label');
      expect(node.defaultValue).toBe('default');
    });

    it('应该能够创建带有子节点的变量树节点', () => {
      const node: ViewVariableTreeNode = {
        key: 'parent',
        type: ViewVariableType.Object,
        name: 'Parent Node',
        children: [
          {
            key: 'child1',
            type: ViewVariableType.String,
            name: 'Child Node 1',
          },
          {
            key: 'child2',
            type: ViewVariableType.Number,
            name: 'Child Node 2',
          },
        ],
      };

      expect(node.children).toHaveLength(2);
      expect(node.children?.[0].key).toBe('child1');
      expect(node.children?.[1].type).toBe(ViewVariableType.Number);
    });
  });

  describe('ViewVariableMeta 类型', () => {
    it('应该能够创建基本的变量元数据', () => {
      const meta: ViewVariableMeta = {
        key: 'test',
        type: ViewVariableType.String,
        name: 'Test Meta',
        required: true,
        description: 'Test Description',
        readonly: true,
        mutable: false,
      };

      expect(meta.key).toBe('test');
      expect(meta.type).toBe(ViewVariableType.String);
      expect(meta.name).toBe('Test Meta');
      expect(meta.required).toBe(true);
      expect(meta.description).toBe('Test Description');
      expect(meta.readonly).toBe(true);
      expect(meta.mutable).toBe(false);
    });

    it('应该继承 ViewVariableTreeNode 的所有属性', () => {
      const meta: ViewVariableMeta = {
        key: 'test',
        type: ViewVariableType.String,
        name: 'Test Meta',
        isPreset: true,
        enabled: true,
        label: 'Custom Label',
        defaultValue: 'default',
        readonly: true,
        mutable: false,
      };

      expect(meta.isPreset).toBe(true);
      expect(meta.enabled).toBe(true);
      expect(meta.label).toBe('Custom Label');
      expect(meta.defaultValue).toBe('default');
    });
  });

  describe('ViewVariableTreeNode 命名空间函数', () => {
    const createTestTree = (): ViewVariableTreeNode => ({
      key: 'root',
      type: ViewVariableType.Object,
      name: 'Root',
      children: [
        {
          key: 'child1',
          type: ViewVariableType.Object,
          name: 'Child1',
          children: [
            {
              key: 'grandchild1',
              type: ViewVariableType.String,
              name: 'GrandChild1',
            },
          ],
        },
        {
          key: 'child2',
          type: ViewVariableType.String,
          name: 'Child2',
        },
      ],
    });

    describe('getVariableTreeNodeByPath', () => {
      it('应该能够通过路径找到正确的节点', () => {
        const tree = createTestTree();
        const node = ViewVariableTreeNode.getVariableTreeNodeByPath(tree, [
          'root',
          'child1',
          'grandchild1',
        ]);

        expect(node).toBeDefined();
        expect(node?.key).toBe('grandchild1');
        expect(node?.name).toBe('GrandChild1');
      });

      it('应该在路径无效时返回 undefined', () => {
        const tree = createTestTree();
        const node = ViewVariableTreeNode.getVariableTreeNodeByPath(tree, [
          'root',
          'nonexistent',
        ]);

        expect(node).toBeUndefined();
      });

      it('应该能处理空路径', () => {
        const tree = createTestTree();
        const node = ViewVariableTreeNode.getVariableTreeNodeByPath(tree, []);

        expect(node).toBeDefined();
        expect(node?.key).toBe('root');
      });
    });

    describe('keyPathToNameString', () => {
      it('应该能够将路径转换为名称字符串', () => {
        const tree = createTestTree();
        const nameStr = ViewVariableTreeNode.keyPathToNameString(tree, [
          'root',
          'child1',
          'grandchild1',
        ]);

        expect(nameStr).toBe('Root.Child1.GrandChild1');
      });

      it('应该在路径无效时返回空字符串', () => {
        const tree = createTestTree();
        const nameStr = ViewVariableTreeNode.keyPathToNameString(tree, [
          'root',
          'nonexistent',
        ]);

        expect(nameStr).toBe('');
      });

      it('应该能处理空路径', () => {
        const tree = createTestTree();
        const nameStr = ViewVariableTreeNode.keyPathToNameString(tree, []);

        expect(nameStr).toBe('');
      });
    });

    describe('nameStringToKeyPath', () => {
      it('应该能够将名称字符串转换为路径', () => {
        const tree = createTestTree();
        const keyPath = ViewVariableTreeNode.nameStringToKeyPath(
          tree,
          'Root.Child1.GrandChild1',
        );

        expect(keyPath).toEqual(['root', 'child1', 'grandchild1']);
      });

      it('应该在名称无效时返回空数组', () => {
        const tree = createTestTree();
        const keyPath = ViewVariableTreeNode.nameStringToKeyPath(
          tree,
          'Root.NonExistent',
        );

        expect(keyPath).toEqual([]);
      });

      it('应该能处理空字符串', () => {
        const tree = createTestTree();
        const keyPath = ViewVariableTreeNode.nameStringToKeyPath(tree, '');

        expect(keyPath).toEqual([]);
      });
    });
  });
});
