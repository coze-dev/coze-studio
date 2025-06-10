/**
 * 获取图片 Node 中的 Url
 * @param node Node 任意Node
 * @returns string
 */
export const getPictureNodeUrl = (node: Node) => {
  if (!('src' in node) || !(typeof node.src === 'string')) {
    return;
  }

  return node.src;
};
