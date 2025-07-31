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

import React from 'react';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';

import { StandardNodeType } from '../../src/types';
import { useWorkflowNode } from '../../src/hooks/use-workflow-node';
import { type WorkflowNode } from '../../src/entities';
import { WorkflowNodeContext } from '../../src/contexts';

describe('useWorkflowNode', () => {
  const createMockWorkflowNode = (id: string): WorkflowNode => {
    const mockRegistry = {
      getNodeInputParameters: vi.fn().mockReturnValue([]),
      getNodeOutputs: vi.fn().mockReturnValue([]),
    };

    const workflowNode = {
      type: StandardNodeType.Start,
      registry: mockRegistry,
      inputParameters: [],
      outputs: [],
      data: {},
      icon: '',
      title: '',
      description: '',
      isError: false,
      isInitialized: true,
      setData: vi.fn(),
    };

    return workflowNode as unknown as WorkflowNode;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('应该返回 WorkflowNode 的观察值', () => {
    const mockWorkflowNode = createMockWorkflowNode('1');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkflowNodeContext.Provider value={mockWorkflowNode}>
        {children}
      </WorkflowNodeContext.Provider>
    );

    const { result } = renderHook(() => useWorkflowNode(), { wrapper });

    expect(result.current).toEqual({
      type: StandardNodeType.Start,
      inputParameters: [],
      outputs: [],
      data: {},
      icon: '',
      title: '',
      description: '',
      isError: false,
      isInitialized: true,
      registry: mockWorkflowNode.registry,
      setData: expect.any(Function),
    });
  });

  it('应该正确绑定 setData 方法', async () => {
    const mockWorkflowNode = createMockWorkflowNode('1');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkflowNodeContext.Provider value={mockWorkflowNode}>
        {children}
      </WorkflowNodeContext.Provider>
    );

    const { result } = renderHook(() => useWorkflowNode(), { wrapper });

    const newData = { test: 'new data' };
    await act(() => {
      result.current.setData(newData);
      return Promise.resolve();
    });

    expect(mockWorkflowNode.setData).toHaveBeenCalledWith(newData);
  });
});
