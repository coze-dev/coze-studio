import { type FlowNodeEntity } from '@flowgram-adapter/fixed-layout-editor';

const getParentOfNoBlock = (
  node: FlowNodeEntity,
): FlowNodeEntity | undefined => {
  if (!node.parent) {
    return undefined;
  }
  if (node.parent.flowNodeType === 'block') {
    return getParentOfNoBlock(node.parent);
  }
  return node.parent;
};

export const getParentChildrenCount = (node: FlowNodeEntity) => {
  const parent = getParentOfNoBlock(node);
  return parent?.children?.length || 0;
};

export const getTreeIdFromNodeId = (id: string) =>
  id.replace('$blockIcon$', '');

export const getNodeIdFromTreeId = (id: string) => `$blockIcon$${id}`;
