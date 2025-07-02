// 辅助函数，用于获取选区内的所有节点
export const getAllChildNodesInNode = (node: Node): Node[] => {
  const nodes: Node[] = [];
  const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ALL, {
    acceptNode: _node =>
      node.contains(_node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  // eslint-disable-next-line prefer-destructuring -- 符合预期，因为要改数据并且允许为空
  let currentNode: Node | null = treeWalker.currentNode;

  while (currentNode) {
    nodes.push(currentNode);
    currentNode = treeWalker.nextNode();
  }

  return nodes;
};
