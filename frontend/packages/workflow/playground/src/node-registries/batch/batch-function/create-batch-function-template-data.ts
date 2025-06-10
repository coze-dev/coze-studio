import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';
import type { BasicStandardNodeTypes } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

/** 同步节点模版数据 */
export const createBatchFunctionTemplateData = (
  batchNode: WorkflowNodeEntity,
  batchFunctionNode: WorkflowNodeEntity,
) => {
  const batchNodeDataEntity =
    batchNode.getData<WorkflowNodeData>(WorkflowNodeData);
  const batchFunctionNodeDataEntity =
    batchFunctionNode.getData<WorkflowNodeData>(WorkflowNodeData);
  const batchNodeData = batchNodeDataEntity.getNodeData<keyof NodeData>();
  if (!batchNodeData) {
    return;
  }
  batchFunctionNodeDataEntity.setNodeData<BasicStandardNodeTypes>({
    title: I18n.t('workflow_batch_canvas_title'),
    description: I18n.t('workflow_batch_canvas_tooltips'),
    icon: batchNodeData.icon,
    mainColor: batchNodeData.mainColor,
  });
};
