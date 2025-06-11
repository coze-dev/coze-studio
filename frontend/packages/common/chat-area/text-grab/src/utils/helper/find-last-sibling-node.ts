import { getAncestorAttributeValue } from '../get-ancestor-attribute-value';

/**
 * 寻找某节点的最后一个兄弟节点
 * @param node 寻找节点
 * @returns
 */
export const findLastSiblingNode = ({
  node,
  scopeAncestorAttributeName,
  targetAttributeValue,
}: {
  node: Node | null;
  scopeAncestorAttributeName?: string;
  targetAttributeValue?: string | null;
}): Node | null => {
  let lastValidSibling: Node | null = null;
  while (node) {
    if (
      scopeAncestorAttributeName &&
      getAncestorAttributeValue(node, scopeAncestorAttributeName) ===
        targetAttributeValue
    ) {
      lastValidSibling = node;
    }
    node = node.nextSibling;
  }
  return lastValidSibling;
};
