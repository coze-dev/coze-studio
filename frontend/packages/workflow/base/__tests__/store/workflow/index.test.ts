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

import { describe, it, expect, beforeEach } from 'vitest';
import type { WorkflowEdgeJSON } from '@flowgram-adapter/free-layout-editor';

import type { WorkflowNodeJSON } from '../../../src/types';
import { useWorkflowStore } from '../../../src/store/workflow';

describe('useWorkflowStore', () => {
  beforeEach(() => {
    // Reset store state
    useWorkflowStore.setState({
      nodes: [],
      edges: [],
      isCreatingWorkflow: false,
    });
  });

  it('应该有正确的初始状态', () => {
    const state = useWorkflowStore.getState();
    expect(state.nodes).toEqual([]);
    expect(state.edges).toEqual([]);
    expect(state.isCreatingWorkflow).toBe(false);
  });

  describe('setNodes', () => {
    it('应该正确设置节点数据', () => {
      const mockNodes: WorkflowNodeJSON[] = [
        {
          id: '1',
          type: 'test',
          data: {},
          meta: {
            position: { x: 0, y: 0 },
          },
        },
        {
          id: '2',
          type: 'test',
          data: {},
          meta: {
            position: { x: 100, y: 100 },
          },
        },
      ];

      useWorkflowStore.getState().setNodes(mockNodes);
      expect(useWorkflowStore.getState().nodes).toEqual(mockNodes);
    });

    it('应该能够重置为空数组', () => {
      // Let's set up some data.
      useWorkflowStore.getState().setNodes([
        {
          id: '1',
          type: 'test',
          data: {},
          meta: {
            position: { x: 0, y: 0 },
          },
        },
      ]);

      // Set to empty array
      useWorkflowStore.getState().setNodes([]);
      expect(useWorkflowStore.getState().nodes).toEqual([]);
    });
  });

  describe('setEdges', () => {
    it('应该正确设置边数据', () => {
      const mockEdges: WorkflowEdgeJSON[] = [
        {
          sourceNodeID: '1',
          targetNodeID: '2',
        },
        {
          sourceNodeID: '2',
          targetNodeID: '3',
        },
      ];

      useWorkflowStore.getState().setEdges(mockEdges);
      expect(useWorkflowStore.getState().edges).toEqual(mockEdges);
    });

    it('应该能够重置为空数组', () => {
      // Let's set up some data.
      useWorkflowStore.getState().setEdges([
        {
          sourceNodeID: '1',
          targetNodeID: '2',
        },
      ]);

      // Set to empty array
      useWorkflowStore.getState().setEdges([]);
      expect(useWorkflowStore.getState().edges).toEqual([]);
    });
  });

  describe('setIsCreatingWorkflow', () => {
    it('应该正确设置创建状态', () => {
      // Set to true
      useWorkflowStore.getState().setIsCreatingWorkflow(true);
      expect(useWorkflowStore.getState().isCreatingWorkflow).toBe(true);

      // Set to false
      useWorkflowStore.getState().setIsCreatingWorkflow(false);
      expect(useWorkflowStore.getState().isCreatingWorkflow).toBe(false);
    });
  });

  describe('状态更新', () => {
    it('应该能够同时更新多个状态', () => {
      const mockNodes: WorkflowNodeJSON[] = [
        {
          id: '1',
          type: 'test',
          data: {},
          meta: {
            position: { x: 0, y: 0 },
          },
        },
      ];

      const mockEdges: WorkflowEdgeJSON[] = [
        {
          sourceNodeID: '1',
          targetNodeID: '2',
        },
      ];

      useWorkflowStore.setState({
        nodes: mockNodes,
        edges: mockEdges,
        isCreatingWorkflow: true,
      });

      const state = useWorkflowStore.getState();
      expect(state.nodes).toEqual(mockNodes);
      expect(state.edges).toEqual(mockEdges);
      expect(state.isCreatingWorkflow).toBe(true);
    });
  });
});
