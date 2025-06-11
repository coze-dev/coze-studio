import { useMemo } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { isApiNode, isSubWorkflowNode } from '@/services/node-version-service';

export const useNodeOrigin = (node: FlowNodeEntity) => {
  const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const isApi = useMemo(() => isApiNode(node), [node]);

  /**
   * 是否是引用节点
   */
  const isReference = useMemo(
    () => isApi || isSubWorkflowNode(node),
    [isApi, node],
  );

  /**
   * 是否来自项目
   * 1. 节点存在 projectId
   */
  const isFromProject =
    isReference &&
    !!nodeData.getNodeData<StandardNodeType.SubWorkflow>().projectId;

  /**
   * 是否来自商店
   * 1. 插件节点
   * 2. 节点不来自项目
   * 3. 存在上架状态
   */
  const isFromStore =
    isApi &&
    !isFromProject &&
    !!nodeData.getNodeData<StandardNodeType.Api>().pluginProductStatus;

  /**
   * 是否来自资源库
   * 1. 引用类型的节点
   * 2. 不来自于项目或者商店
   */
  const isFromLibrary = isReference && !isFromProject && !isFromStore;

  return {
    isApi,
    isFromStore,
    isFromLibrary,
  };
};
