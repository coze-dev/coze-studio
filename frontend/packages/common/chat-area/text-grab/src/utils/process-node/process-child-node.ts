import { processSpecialNode } from './process-special-node';

export const processChildNode = (childNodes: NodeListOf<Node>) => {
  const childNodeList: Node[] = [];

  if (!childNodes.length) {
    return;
  }

  for (const childNode of childNodes) {
    const specialNode = processSpecialNode(childNode);

    if (specialNode) {
      childNodeList.push(specialNode);
      continue;
    }

    const result = processChildNode(childNode.childNodes);

    if (!result) {
      childNodeList.push(childNode);
      continue;
    }

    childNodeList.push(...result);
  }

  return childNodeList;
};
