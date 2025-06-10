/**
 * 判断节点包含关系
 * 参考文档「https://developer.mozilla.org/zh-CN/docs/Web/API/Node/compareDocumentPosition」
 * @param nodeA
 * @param nodeB
 *
 */
export const compareNodePosition = (nodeA: Node, nodeB: Node) => {
  const comparison = nodeA.compareDocumentPosition(nodeB);

  // 之所以条件跟返回是反的，请参考官方文档，包含关系展示的是B - A的关系
  if (comparison & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return 'contains'; // nodeA 包含 nodeB
  } else if (comparison & Node.DOCUMENT_POSITION_CONTAINS) {
    return 'containedBy'; // nodeA 被 nodeB 包含
  } else if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) {
    return 'before'; // nodeA 在 nodeB 之前
  } else if (comparison & Node.DOCUMENT_POSITION_PRECEDING) {
    return 'after'; // nodeA 在 nodeB 之后
  }

  return 'none'; // 节点是相同的或者没有可比较的关系
};
