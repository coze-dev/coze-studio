import { findLastChildNode } from '../helper/find-last-child-node';
import { getAncestorAttributeValue } from '../get-ancestor-attribute-value';

export const fixEndNode = ({
  range,
  targetAttributeName,
  targetAttributeValue,
}: {
  range: Range;
  targetAttributeName: string;
  targetAttributeValue: string;
}) => {
  let endNode: Node | null = range.endContainer;
  let { endOffset } = range;

  // 确保结束节点符合条件
  while (
    endNode &&
    !(
      getAncestorAttributeValue(endNode, targetAttributeName) ===
      targetAttributeValue
    )
  ) {
    if (endNode.nextSibling) {
      endNode = endNode.nextSibling;
      endOffset = 0; // 从下一个兄弟节点的开始位置开始
    } else if (endNode.parentNode && endNode.parentNode !== document) {
      endNode = endNode.parentNode;
      endOffset = endNode
        ? findLastChildNode(endNode).textContent?.length ?? 0
        : 0; // 从父节点的最后位置开始
    } else {
      // 没有符合条件的结束节点
      endNode = null;
      break;
    }
  }

  return {
    endNode,
    endOffset,
  };
};
