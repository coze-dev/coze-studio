import { getAncestorAttributeValue } from '../get-ancestor-attribute-value';

export const fixStartNode = ({
  range,
  targetAttributeName,
  targetAttributeValue,
}: {
  range: Range;
  targetAttributeName: string;
  targetAttributeValue: string;
}) => {
  let startNode: Node | null = range.startContainer;
  let { startOffset } = range;

  // 确保起始节点符合条件
  while (
    startNode &&
    !(
      getAncestorAttributeValue(startNode, targetAttributeName) ===
      targetAttributeValue
    )
  ) {
    if (startNode.previousSibling) {
      startNode = startNode.previousSibling;
      startOffset = 0; // 从前一个兄弟节点的开始位置开始
    } else if (startNode.parentNode && startNode.parentNode !== document) {
      startNode = startNode.parentNode;
      startOffset = 0; // 从父节点的开始位置开始
    } else {
      // 没有符合条件的起始节点
      startNode = null;
      break;
    }
  }

  return {
    startNode,
    startOffset,
  };
};
