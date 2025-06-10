import { compareNodePosition } from './compare-node-position';

export const findNotContainsPreviousSibling = (
  node: Node | null,
): Node | null => {
  if (!node || node === document) {
    return null;
  }

  let sibling: Node | null = node.previousSibling ?? node.parentNode;

  while (sibling) {
    if (sibling === document) {
      return null;
    }

    // 获取两个节点之间的关系
    const relationship = compareNodePosition(sibling, node);

    // 如果两个节点之间没有包含关系，则返回当前兄弟节点
    if (!['containedBy', 'contains'].includes(relationship)) {
      return sibling;
    }

    if (!sibling.previousSibling) {
      sibling = sibling.parentNode;
    } else {
      sibling = sibling.previousSibling;
    }
  }

  return null;
};
