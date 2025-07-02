import {
  FlowNodeBaseType,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowSubCanvas } from '@flowgram-adapter/free-layout-editor';

/**
 * 多节点是否在子画布中
 * @param nodes
 * @returns
 */
export const isNodesInSubCanvas = (nodes?: FlowNodeEntity[]) =>
  isNodeInSubCanvas(nodes?.[0]);

/**
 * 单节点是否在子画布中
 * @param nodes
 * @returns
 */
export const isNodeInSubCanvas = (node?: FlowNodeEntity) =>
  node?.parent?.id !== 'root';

/**
 * 是不是子画布节点
 * @param node
 * @returns
 */
export const isSubCanvasNode = (node?: FlowNodeEntity) =>
  node?.flowNodeType === FlowNodeBaseType.SUB_CANVAS;

/**
 * 获取子画布的父节点
 * @param node
 * @returns
 */
export const getSubCanvasParent = (node?: FlowNodeEntity) => {
  const nodeMeta = node?.getNodeMeta();
  const subCanvas: WorkflowSubCanvas = nodeMeta?.subCanvas(node);
  return subCanvas?.parentNode;
};
