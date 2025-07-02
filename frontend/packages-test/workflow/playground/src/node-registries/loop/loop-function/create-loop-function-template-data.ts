import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';
import type { BasicStandardNodeTypes } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

/** 同步节点模版数据 */
export const createLoopFunctionTemplateData = (
  loopNode: WorkflowNodeEntity,
  loopFunctionNode: WorkflowNodeEntity,
) => {
  const loopNodeDataEntity =
    loopNode.getData<WorkflowNodeData>(WorkflowNodeData);
  const loopFunctionNodeDataEntity =
    loopFunctionNode.getData<WorkflowNodeData>(WorkflowNodeData);
  const loopNodeData = loopNodeDataEntity.getNodeData<keyof NodeData>();
  if (!loopNodeData) {
    return;
  }
  loopFunctionNodeDataEntity.setNodeData<BasicStandardNodeTypes>({
    title: I18n.t('workflow_loop_body_canva'),
    description: I18n.t('workflow_loop_body_canva_tips'),
    icon: loopNodeData.icon,
    mainColor: loopNodeData.mainColor,
  });
};
