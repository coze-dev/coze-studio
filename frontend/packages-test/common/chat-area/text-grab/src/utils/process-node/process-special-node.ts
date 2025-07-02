import { findPictureValidChildNode } from '../find-picture-valid-child-node';

/**
 * 处理特殊 Node 节点数据
 * @param node Node
 * @returns node | undefined
 */
export const processSpecialNode = (node: Node) => {
  // 针对picture类型的特殊优化
  if (node.nodeName.toUpperCase() === 'PICTURE') {
    const pictureNode = findPictureValidChildNode(node.childNodes);

    if (pictureNode) {
      return pictureNode;
    }
  }

  // 针对链接的特殊优化
  if (node.nodeName.toUpperCase() === 'A') {
    return node;
  }

  // 针对表格的特殊优化
  if (['TH', 'TD'].includes(node.nodeName.toUpperCase())) {
    return node;
  }

  return;
};
