import { isEmpty } from 'lodash-es';
import {
  type FlowNodeEntity,
  FlowNodeBaseType,
} from '@flowgram-adapter/fixed-layout-editor';

export const getStoreNode = (node: FlowNodeEntity) => {
  const isBlockOrderIcon =
    node.flowNodeType === FlowNodeBaseType.BLOCK_ORDER_ICON;
  const isBlockIcon = node.flowNodeType === FlowNodeBaseType.BLOCK_ICON;
  return {
    node: isBlockOrderIcon || isBlockIcon ? node.parent! : node,
    updateCurrent: !(isBlockOrderIcon || isBlockIcon),
  };
};

export const updateNodeExtInfo = (
  renderNode: FlowNodeEntity,
  info: Record<string, any>,
) => {
  const { node, updateCurrent } = getStoreNode(renderNode);
  if (!updateCurrent) {
    renderNode.updateExtInfo(info);
  }
  if (isEmpty(node.getExtInfo())) {
    return;
  } else {
    node.updateExtInfo(info);
  }
};

export const getNodeExtInfo = (renderNode: FlowNodeEntity) => {
  const { node } = getStoreNode(renderNode);
  return node.getExtInfo();
};
