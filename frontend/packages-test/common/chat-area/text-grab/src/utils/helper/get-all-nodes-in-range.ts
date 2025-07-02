// 辅助函数，用于获取选区内的所有节点
export const getAllNodesInRange = (range: Range): Node[] => {
  const nodes: Node[] = [];
  const treeWalker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ALL,
    {
      acceptNode: node =>
        range.intersectsNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    },
  );

  // eslint-disable-next-line prefer-destructuring -- 符合预期，因为要改数据并且允许为空
  let currentNode: Node | null = treeWalker.currentNode;

  while (currentNode) {
    nodes.push(currentNode);
    currentNode = treeWalker.nextNode();
  }

  return nodes;
};
