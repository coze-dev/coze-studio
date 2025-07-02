export const getAncestorAttributeValue = (
  node: Node | null,
  attributeName: string,
): string | null => {
  while (node && node !== document) {
    let attributeValue = null;
    if (node instanceof Element) {
      attributeValue = node.attributes.getNamedItem(attributeName)?.value;
    }

    if (node.nodeType === Node.ELEMENT_NODE && attributeValue) {
      return attributeValue;
    }
    node = node.parentNode;
  }
  return null;
};
