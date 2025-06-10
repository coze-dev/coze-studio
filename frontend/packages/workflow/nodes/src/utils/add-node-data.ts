import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type BasicStandardNodeTypes,
  type StandardNodeType,
} from '@coze-workflow/base/types';

import { type PlaygroundContext } from '../typings';
import { type NodeData, WorkflowNodeData } from '../entity-datas';

/**
 *
 * @param node
 * @param data
 * 给基础类型节点设置节点数据，不要随意修改
 */
export const addBasicNodeData = (
  node: FlowNodeEntity,
  playgroundContext: PlaygroundContext,
) => {
  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const meta = playgroundContext.getNodeTemplateInfoByType(
    node.flowNodeType as StandardNodeType,
  );
  const nodeData = nodeDataEntity.getNodeData<keyof NodeData>();

  // 在部分节点的 formMeta 方法，会重复执行，因此这里加个检测
  if (!nodeData && meta) {
    nodeDataEntity.setNodeData<BasicStandardNodeTypes>({
      icon: meta.icon,
      description: meta.description,
      title: meta.title,
      mainColor: meta.mainColor,
    });
  }
};
