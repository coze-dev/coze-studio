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
import {
  FlowNodeFormData,
  FlowNodeErrorData,
} from '@flowgram-adapter/free-layout-editor';

import { StandardNodeType } from '../../src/types';
import { WorkflowNode } from '../../src/entities';

// Mock entities
vi.mock('../../src/entities', async () => {
  const actual = await vi.importActual('../../src/entities');
  return {
    ...actual,
    // If you need to mock other entities, you can add them here.
  };
});

vi.mock('../../src/utils', () => ({
  getFormValueByPathEnds: vi.fn(),
}));

describe('WorkflowNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockFormModel = () => ({
    initialized: true,
    getFormItemValueByPath: vi.fn(),
    getFormItemByPath: vi.fn(),
    formItemPathMap: new Map(),
    onInitialized: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  });

  const createMockNode = () => {
    const mockFormModel = createMockFormModel();
    const mockFormData = {
      formModel: mockFormModel,
      onDataChange: vi.fn().mockReturnValue({ dispose: vi.fn() }),
    };

    return {
      flowNodeType: StandardNodeType.Start,
      getNodeRegistry: vi.fn().mockReturnValue({
        getNodeInputParameters: vi.fn().mockReturnValue([]),
        getNodeOutputs: vi.fn().mockReturnValue([]),
      }),
      getNodeMeta: vi.fn(),
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
  };

  describe('基本属性', () => {
    it('should get node type', () => {
      const mockNode = createMockNode();
      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.type).toBe(StandardNodeType.Start);
    });

    it('should get node registry', () => {
      const mockRegistry = { test: 'registry' };
      const mockNode = createMockNode();
      mockNode.getNodeRegistry.mockReturnValue(mockRegistry);

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.registry).toBe(mockRegistry);
    });

    it('should check if node has error', () => {
      const mockNode = createMockNode();
      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.isError).toBe(false);

      mockNode.getData.mockImplementation(dataType => {
        if (dataType === FlowNodeErrorData) {
          return {
            getError: vi.fn().mockReturnValue(new Error('Test error')),
          };
        }
        return null;
      });

      expect(workflowNode.isError).toBe(true);
    });

    it('should check if node is initialized', () => {
      const mockNode = createMockNode();
      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.isInitialized).toBe(true);

      mockNode._formModel.initialized = false;
      expect(workflowNode.isInitialized).toBe(false);
    });

    it('should handle undefined node type', () => {
      const mockNode = createMockNode();
      mockNode.flowNodeType = StandardNodeType.Start;
      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.type).toBe(StandardNodeType.Start);
    });

    it('should handle null registry', () => {
      const mockNode = createMockNode();
      mockNode.getNodeRegistry.mockReturnValue(null);
      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.registry).toBeNull();
    });

    it('should handle error data access failure', () => {
      const mockNode = createMockNode();
      mockNode.getData.mockReturnValue({
        getError: vi.fn().mockReturnValue(undefined),
      });
      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.isError).toBe(false);
    });
  });

  describe('表单数据管理', () => {
    it('should get form data', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemValueByPath.mockReturnValue({
        test: 'data',
      });

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.data).toEqual({ test: 'data' });
      expect(mockNode._formModel.getFormItemValueByPath).toHaveBeenCalledWith(
        '/',
      );
    });

    it('should set form data', () => {
      const mockNode = createMockNode();
      const mockFormItem = { value: null };
      mockNode._formModel.getFormItemByPath.mockReturnValue(mockFormItem);

      const workflowNode = new WorkflowNode(mockNode as any);
      const newData = { test: 'new data' };
      workflowNode.setData(newData);

      expect(mockNode._formModel.getFormItemByPath).toHaveBeenCalledWith('/');
      expect(mockFormItem.value).toEqual(newData);
    });

    it('should handle setting data when form item does not exist', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemByPath.mockReturnValue(null);

      const workflowNode = new WorkflowNode(mockNode as any);
      workflowNode.setData({ test: 'data' });

      expect(mockNode._formModel.getFormItemByPath).toHaveBeenCalledWith('/');
    });

    it('should handle invalid form data', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemValueByPath.mockReturnValue(undefined);

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.data).toBeUndefined();
    });

    it('should handle form item value mutation', () => {
      const mockNode = createMockNode();
      const mockFormItem = { value: { test: 'original' } };
      mockNode._formModel.getFormItemByPath.mockReturnValue(mockFormItem);

      const workflowNode = new WorkflowNode(mockNode as any);
      const newData = { test: 'new data' };
      workflowNode.setData(newData);

      // Verify that the original data source has not been modified
      expect(newData).toEqual({ test: 'new data' });
      expect(mockFormItem.value).toEqual({ test: 'new data' });
    });
  });

  describe('输入输出参数', () => {
    it('should get input parameters from registry', () => {
      const mockInputParams = [{ name: 'test', type: 'string' }];
      const mockNode = createMockNode();
      mockNode.getNodeRegistry.mockReturnValue({
        getNodeInputParameters: vi.fn().mockReturnValue(mockInputParams),
      });

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.inputParameters).toEqual(mockInputParams);
    });

    it('should get outputs from registry', () => {
      const mockOutputs = [{ name: 'test', type: 'string' }];
      const mockNode = createMockNode();
      mockNode.getNodeRegistry.mockReturnValue({
        getNodeOutputs: vi.fn().mockReturnValue(mockOutputs),
      });

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.outputs).toEqual(mockOutputs);
    });

    it('should get outputs from form', () => {
      const mockOutputs = [{ name: 'test', type: 'string' }];
      const mockNode = createMockNode();
      mockNode.getNodeRegistry.mockReturnValue({
        getNodeInputParameters: vi.fn().mockReturnValue([]),
        getNodeOutputs: vi.fn().mockReturnValue(mockOutputs),
      });

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.outputs).toEqual(mockOutputs);
    });

    it('should handle invalid input parameters path', () => {
      const mockNode = createMockNode();
      mockNode.getNodeMeta.mockReturnValue({
        inputParametersPath: null,
      });

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.inputParameters).toEqual([]);
    });

    it('should handle circular references in parameters', () => {
      const mockNode = createMockNode();
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      mockNode.getNodeRegistry.mockReturnValue({
        getNodeInputParameters: vi.fn().mockReturnValue([circularObj]),
      });

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(() => JSON.stringify(workflowNode.inputParameters)).toThrow();
    });

    it('should handle empty outputs path', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemValueByPath.mockReturnValue(null);

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.outputs).toEqual([]);
    });
  });

  describe('元数据', () => {
    it('should get node metadata', () => {
      const mockNode = createMockNode();
      const mockData = {
        nodeMeta: {
          icon: 'test-icon',
          title: 'Test Node',
          description: 'Test Description',
        },
      };
      mockNode._formModel.getFormItemValueByPath.mockReturnValue(mockData);

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.icon).toBe(mockData.nodeMeta.icon);
      expect(workflowNode.title).toBe(mockData.nodeMeta.title);
      expect(workflowNode.description).toBe(mockData.nodeMeta.description);
    });

    it('should handle missing metadata', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemValueByPath.mockReturnValue({});

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.icon).toBeUndefined();
      expect(workflowNode.title).toBeUndefined();
      expect(workflowNode.description).toBeUndefined();
    });

    it('should handle null metadata', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemValueByPath.mockReturnValue(null);

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.icon).toBeUndefined();
      expect(workflowNode.title).toBeUndefined();
      expect(workflowNode.description).toBeUndefined();
    });

    it('should handle metadata access error', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemValueByPath.mockReturnValue(null);

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.icon).toBeUndefined();
      expect(workflowNode.title).toBeUndefined();
      expect(workflowNode.description).toBeUndefined();
    });

    it('should handle partial metadata', () => {
      const mockNode = createMockNode();
      mockNode._formModel.getFormItemValueByPath.mockReturnValue({
        nodeMeta: {
          icon: 'test-icon',
          // title and description missing
        },
      });

      const workflowNode = new WorkflowNode(mockNode as any);
      expect(workflowNode.icon).toBe('test-icon');
      expect(workflowNode.title).toBeUndefined();
      expect(workflowNode.description).toBeUndefined();
    });
  });
});
