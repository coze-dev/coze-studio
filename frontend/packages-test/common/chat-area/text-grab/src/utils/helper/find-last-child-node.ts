/**
 * 寻找某节点最后一个子节点
 * @param node Node
 * @returns Node
 */
export const findLastChildNode = (node: Node): Node => {
  while (node.lastChild) {
    node = node.lastChild;
  }
  return node;
};
