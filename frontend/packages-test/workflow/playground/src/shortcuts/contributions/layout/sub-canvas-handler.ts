import type { LayoutNode } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import type { WorkflowNodeMeta } from '@coze-workflow/nodes';

export const subCanvasHandler = (node: LayoutNode) => {
  if (node.entity.flowNodeType !== FlowNodeBaseType.SUB_CANVAS) {
    return;
  }
  const nodeMeta = node.entity.getNodeMeta<WorkflowNodeMeta>();
  const subCanvas = nodeMeta.subCanvas?.(node.entity);
  return {
    followTo: subCanvas?.parentNode.id,
  };
};
