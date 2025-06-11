export const findNearestAnchor = (
  node: Node | null,
): HTMLAnchorElement | null => {
  // 从当前节点开始向上遍历
  while (node) {
    // 如果当前节点是元素节点并且是<a>标签
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'A') {
      // 返回这个<a>标签
      return node as HTMLAnchorElement;
    }
    // 向上移动到父节点
    node = node.parentNode;
  }
  // 如果遍历到根节点还没有找到<a>标签，返回null
  return null;
};
