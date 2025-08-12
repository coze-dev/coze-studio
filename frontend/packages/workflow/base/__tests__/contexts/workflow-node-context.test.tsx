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

import React, { useContext } from 'react';

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  FlowNodeFormData,
  FlowNodeErrorData,
} from '@flowgram-adapter/free-layout-editor';

import { StandardNodeType } from '../../src/types';
import { type WorkflowNode } from '../../src/entities';
import { WorkflowNodeContext } from '../../src/contexts/workflow-node-context';

describe('WorkflowNodeContext', () => {
  const createMockWorkflowNode = (id: string): WorkflowNode => {
    const dispose = vi.fn();
    const mockFormModel = {
      initialized: true,
      getFormItemValueByPath: vi.fn(),
      getFormItemByPath: vi.fn(),
      formItemPathMap: new Map(),
      onInitialized: vi.fn().mockReturnValue({ dispose }),
    };

    const mockFormData = {
      formModel: mockFormModel,
      onDataChange: vi.fn().mockReturnValue({ dispose }),
    };

    const mockRegistry = {
      getNodeInputParameters: vi.fn().mockReturnValue([]),
      getNodeOutputs: vi.fn().mockReturnValue([]),
    };

    const mockNode = {
      id,
      flowNodeType: StandardNodeType.Start,
      getNodeRegistry: vi.fn().mockReturnValue(mockRegistry),
      getNodeMeta: vi.fn().mockReturnValue({
        icon: '',
        title: '',
        description: '',
      }),
      getData: vi.fn(dataType => {
        if (dataType === FlowNodeFormData) {
          return mockFormData;
        }
        if (dataType === FlowNodeErrorData) {
          return {
            getError: vi.fn().mockReturnValue(null),
          };
        }
        return null;
      }),
      _formModel: mockFormModel,
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
      onDataChange: vi.fn().mockReturnValue({ dispose }),
      onInitialized: vi.fn().mockReturnValue({ dispose }),
      node: mockNode,
      getFormValueByPathEnds: vi.fn(),
      form: mockFormModel,
    };

    return workflowNode as unknown as WorkflowNode;
  };

  it('应该创建一个默认值为 undefined 的 Context', () => {
    const TestComponent = () => {
      const context = useContext(WorkflowNodeContext);
      expect(context).toBeUndefined();
      return null;
    };

    render(<TestComponent />);
  });

  it('应该能够通过 Provider 提供 WorkflowNode 实例', () => {
    const mockWorkflowNode = createMockWorkflowNode('1');

    const TestComponent = () => {
      const context = useContext(WorkflowNodeContext);
      expect(context).toBe(mockWorkflowNode);
      return null;
    };

    render(
      <WorkflowNodeContext.Provider value={mockWorkflowNode}>
        <TestComponent />
      </WorkflowNodeContext.Provider>,
    );
  });

  it('应该能够在嵌套组件中访问 Context', () => {
    const mockWorkflowNode = createMockWorkflowNode('1');

    const ChildComponent = () => {
      const context = useContext(WorkflowNodeContext);
      expect(context).toBe(mockWorkflowNode);
      return null;
    };

    const ParentComponent = () => (
      <div>
        <ChildComponent />
      </div>
    );

    render(
      <WorkflowNodeContext.Provider value={mockWorkflowNode}>
        <ParentComponent />
      </WorkflowNodeContext.Provider>,
    );
  });

  it('应该能够处理 undefined 值', () => {
    const TestComponent = () => {
      const context = useContext(WorkflowNodeContext);
      expect(context).toBeUndefined();
      return null;
    };

    render(
      <WorkflowNodeContext.Provider value={undefined}>
        <TestComponent />
      </WorkflowNodeContext.Provider>,
    );
  });

  it('应该能够在多层 Provider 中正确获取最近的值', () => {
    const mockWorkflowNode1 = createMockWorkflowNode('1');
    const mockWorkflowNode2 = createMockWorkflowNode('2');

    const InnerComponent = () => {
      const context = useContext(WorkflowNodeContext);
      expect(context).toBe(mockWorkflowNode2);
      return null;
    };

    const OuterComponent = () => {
      const context = useContext(WorkflowNodeContext);
      expect(context).toBe(mockWorkflowNode1);
      return (
        <WorkflowNodeContext.Provider value={mockWorkflowNode2}>
          <InnerComponent />
        </WorkflowNodeContext.Provider>
      );
    };

    render(
      <WorkflowNodeContext.Provider value={mockWorkflowNode1}>
        <OuterComponent />
      </WorkflowNodeContext.Provider>,
    );
  });
});
