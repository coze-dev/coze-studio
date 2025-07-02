import { findLastChildNode } from '../src/utils/helper/find-last-child-node';

describe('findLastChildNode', () => {
  it('should return the last child node of a nested node structure', () => {
    // 创建一个嵌套的节点结构
    const parentNode = document.createElement('div');
    const childNode1 = document.createElement('span');
    const childNode2 = document.createElement('p');
    const lastChildNode = document.createElement('a');

    parentNode.appendChild(childNode1);
    childNode1.appendChild(childNode2);
    childNode2.appendChild(lastChildNode);

    // 调用 findLastChildNode 函数
    const result = findLastChildNode(parentNode);

    // 验证结果是否为最深层的子节点
    expect(result).toBe(lastChildNode);
  });

  it('should return the node itself if it has no children', () => {
    // 创建一个没有子节点的节点
    const singleNode = document.createElement('div');

    // 调用 findLastChildNode 函数
    const result = findLastChildNode(singleNode);

    // 验证结果是否为节点本身
    expect(result).toBe(singleNode);
  });
});
