import { getPictureNodeUrl } from './get-picture-node-url';

/**
 * 获取 TagName 为 Picture 的节点的有效节点
 * @param childNodes NodeListOf<Node> 子节点列表
 * @returns Node | null
 */
export const findPictureValidChildNode = (childNodes: NodeListOf<Node>) =>
  Array.from(childNodes)
    .filter(node => getPictureNodeUrl(node))
    .at(0);
