import {
  type WorkflowNodeRegistry,
  type WorkflowNodeJSON,
  type WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';

/**
 * 是否包含有子画布的节点
 */
export const hasSubCanvasNodes = (
  workflowDocument: WorkflowDocument,
  nodes: WorkflowNodeJSON[],
) =>
  !!nodes.find(node => {
    const registry = workflowDocument.getNodeRegister(
      node.type,
    ) as WorkflowNodeRegistry;
    return !!registry?.meta?.subCanvas;
  });
