import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

/**
 * 获取节点的父节点ID
 */
export const getNodesParentId = (nodes: FlowNodeEntity[]): string =>
  nodes[0]?.parent?.id || 'root';
