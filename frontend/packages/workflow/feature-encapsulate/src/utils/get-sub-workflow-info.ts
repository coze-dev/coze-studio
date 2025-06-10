import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

interface SubWorkflowInfo {
  spaceId: string;
  workflowId: string;
  workflowVersion: string;
}

/**
 * 获取子流程信息
 * @param node 子流程节点
 * @returns spaceId 和 workflowId
 */
export function getSubWorkflowInfo(
  node: WorkflowNodeEntity,
): SubWorkflowInfo | undefined {
  const formData = node.getData<FlowNodeFormData>(FlowNodeFormData);
  const formItem = formData?.formModel.getFormItemValueByPath('/inputs');

  if (!formItem) {
    return;
  }

  return {
    spaceId: formItem.spaceId,
    workflowId: formItem.workflowId,
    workflowVersion: formItem.workflowVersion,
  };
}
