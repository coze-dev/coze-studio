export const hasAncestorWithAttribute = (
  node: Node | null,
  attributeName: string,
): boolean => {
  while (node && node !== document) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).attributes.getNamedItem(attributeName)
    ) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};
