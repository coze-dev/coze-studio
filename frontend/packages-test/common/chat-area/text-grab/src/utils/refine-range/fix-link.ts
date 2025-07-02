import { findNearestAnchor } from '../helper/find-nearest-link-node';

export const fixLink = (range: Range, startNode: Node, endNode: Node) => {
  const startAnchor = findNearestAnchor(startNode);
  const endAnchor = findNearestAnchor(endNode);

  let isFix = false;
  // 如果起始节点在链接内，将选区的起点设置为链接的开始
  if (startAnchor) {
    range.setStartBefore(startAnchor);
    isFix = true;
  }

  // 如果结束节点在链接内，将选区的终点设置为链接的结束
  if (endAnchor) {
    range.setEndAfter(endAnchor);
    isFix = true;
  }

  return isFix;
};

/**
 * 1. 链接[A ...文字... 链]接B
 * 2. 链接A ...文[字... 链]接B
 * 3. ...文[字 链]接B
 * 4. 链[接]B
 */
