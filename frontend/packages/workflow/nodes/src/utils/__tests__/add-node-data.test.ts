import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import type { StandardNodeType } from '@coze-workflow/base/types';

import { addBasicNodeData } from '../add-node-data';
import type { PlaygroundContext } from '../../typings';
import { WorkflowNodeData } from '../../entity-datas';

// Mocks
vi.mock('../../entity-datas', () => {
  const WorkflowNodeData1 = vi.fn();
  WorkflowNodeData1.prototype.getNodeData = vi.fn();
  WorkflowNodeData1.prototype.setNodeData = vi.fn();
  return { WorkflowNodeData: WorkflowNodeData1 };
});

const mockGetNodeTemplateInfoByType = vi.fn();

describe('addBasicNodeData', () => {
  let mockNode: Partial<FlowNodeEntity>;
  let mockPlaygroundContext: Partial<PlaygroundContext>;
  let mockNodeDataEntity: WorkflowNodeData;

  beforeEach(() => {
    vi.clearAllMocks();

    // Re-instantiate mocks for WorkflowNodeData for each test
    mockNodeDataEntity = new WorkflowNodeData({} as any, {} as any);

    mockNode = {
      flowNodeType: 'start' as StandardNodeType,
      getData: vi.fn().mockReturnValue(mockNodeDataEntity),
    };

    mockPlaygroundContext = {
      getNodeTemplateInfoByType: mockGetNodeTemplateInfoByType,
    };
  });

  it('should not set node data if nodeData already exists', () => {
    (mockNodeDataEntity.getNodeData as Mock).mockReturnValue({}); // Simulate existing data
    mockGetNodeTemplateInfoByType.mockReturnValue({
      icon: 'icon-path',
      description: 'description',
      title: 'title',
      mainColor: 'color',
    });

    addBasicNodeData(
      mockNode as FlowNodeEntity,
      mockPlaygroundContext as PlaygroundContext,
    );

    expect(mockNode.getData).toHaveBeenCalledWith(WorkflowNodeData);
    expect(mockNodeDataEntity.getNodeData).toHaveBeenCalled();
    expect(
      mockPlaygroundContext.getNodeTemplateInfoByType,
    ).toHaveBeenCalledWith('start');
    expect(mockNodeDataEntity.setNodeData).not.toHaveBeenCalled();
  });

  it('should not set node data if meta is undefined', () => {
    (mockNodeDataEntity.getNodeData as Mock).mockReturnValue(undefined); // Simulate no existing data
    mockGetNodeTemplateInfoByType.mockReturnValue(undefined); // Simulate meta not found

    addBasicNodeData(
      mockNode as FlowNodeEntity,
      mockPlaygroundContext as PlaygroundContext,
    );

    expect(mockNodeDataEntity.setNodeData).not.toHaveBeenCalled();
  });

  it('should set node data if nodeData is undefined and meta is provided', () => {
    (mockNodeDataEntity.getNodeData as Mock).mockReturnValue(undefined); // Simulate no existing data
    const metaInfo = {
      icon: 'icon-path-new',
      description: 'new description',
      title: 'new title',
      mainColor: 'new-color',
    };
    mockGetNodeTemplateInfoByType.mockReturnValue(metaInfo);

    addBasicNodeData(
      mockNode as FlowNodeEntity,
      mockPlaygroundContext as PlaygroundContext,
    );

    expect(mockNodeDataEntity.setNodeData).toHaveBeenCalledWith({
      icon: metaInfo.icon,
      description: metaInfo.description,
      title: metaInfo.title,
      mainColor: metaInfo.mainColor,
    });
  });

  it('should correctly get node type from node.flowNodeType', () => {
    (mockNodeDataEntity.getNodeData as Mock).mockReturnValue(undefined);
    const metaInfo = {
      icon: 'test',
      description: 'test',
      title: 'test',
      mainColor: 'test',
    };
    mockGetNodeTemplateInfoByType.mockReturnValue(metaInfo);
    (mockNode as FlowNodeEntity).flowNodeType =
      'customType' as StandardNodeType;

    addBasicNodeData(
      mockNode as FlowNodeEntity,
      mockPlaygroundContext as PlaygroundContext,
    );

    expect(
      mockPlaygroundContext.getNodeTemplateInfoByType,
    ).toHaveBeenCalledWith('customType');
    expect(mockNodeDataEntity.setNodeData).toHaveBeenCalledWith(metaInfo);
  });
});
