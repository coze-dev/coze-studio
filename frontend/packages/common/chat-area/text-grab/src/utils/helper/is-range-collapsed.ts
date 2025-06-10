export const hasVisibleSelection = (range: Range): boolean => {
  // 克隆Range内的所有节点
  const documentFragment = range.cloneContents();
  const textNodes: Text[] = [];

  // 递归函数来收集所有文本节点
  function collectTextNodes(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    } else {
      node.childNodes.forEach(collectTextNodes);
    }
  }

  // 从文档片段的根节点开始收集文本节点
  collectTextNodes(documentFragment);

  // 检查收集到的文本节点中是否有非空白的文本
  return textNodes.some(textNode => /\S/.test(textNode.textContent || ''));
};
