export const getAncestorAttributeNode = (
  node: Node | null,
  attributeName: string,
): Element | null => {
  while (node && node !== document) {
    let attributeValue = null;
    if (node instanceof Element) {
      attributeValue = node.attributes.getNamedItem(attributeName)?.value;

      if (attributeValue) {
        return node;
      }
    }

    node = node.parentNode;
  }
  return null;
};
