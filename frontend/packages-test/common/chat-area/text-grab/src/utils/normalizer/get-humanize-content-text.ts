import { type GrabNode } from '../../types/node';
import { isGrabTextNode } from './is-grab-text-node';
import { isGrabLink } from './is-grab-link';
import { isGrabImage } from './is-grab-image';

/**
 * 获取人性化文本内容
 */
export const getHumanizedContentText = (normalizeNodeList: GrabNode[]) => {
  let content = '';

  for (const node of normalizeNodeList) {
    if (isGrabTextNode(node)) {
      content += node.text;
    } else if (isGrabLink(node)) {
      content += `[${getHumanizedContentText(node.children)}]`;
    } else if (isGrabImage(node)) {
      content += `![${getHumanizedContentText(node.children)}]`;
    } else {
      content += getHumanizedContentText(node.children);
    }
  }

  return content;
};
