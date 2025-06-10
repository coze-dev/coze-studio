import { compareNodePosition } from '../src/utils/helper/compare-node-position';

describe('compareNodePosition', () => {
  let parentNode: HTMLElement;
  let childNode: HTMLElement;
  let siblingNode: HTMLElement;

  beforeEach(() => {
    // 在每个测试之前创建新的 DOM 结构
    parentNode = document.createElement('div');
    childNode = document.createElement('span');
    siblingNode = document.createElement('p');
    parentNode.appendChild(childNode); // childNode 是 parentNode 的子节点
    parentNode.appendChild(siblingNode); // siblingNode 是 childNode 的同级节点
  });

  it('should return "before" if nodeA is before nodeB', () => {
    expect(compareNodePosition(childNode, siblingNode)).toBe('before');
  });

  it('should return "after" if nodeA is after nodeB', () => {
    expect(compareNodePosition(siblingNode, childNode)).toBe('after');
  });

  it('should return "contains" if nodeA contains nodeB', () => {
    expect(compareNodePosition(parentNode, childNode)).toBe('contains');
  });

  it('should return "containedBy" if nodeA is contained by nodeB', () => {
    expect(compareNodePosition(childNode, parentNode)).toBe('containedBy');
  });

  it('should return "none" for the same node', () => {
    expect(compareNodePosition(parentNode, parentNode)).toBe('none');
  });
});
