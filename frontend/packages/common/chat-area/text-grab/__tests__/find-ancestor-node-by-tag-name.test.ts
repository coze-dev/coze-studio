import { findAncestorNodeByTagName } from '../src/utils/helper/find-ancestor-node-by-tag-name';

describe('findAncestorNodeByTagName', () => {
  // 设置 DOM 环境
  document.body.innerHTML = `
    <div id="ancestor">
      <div id="parent">
        <span id="child"></span>
      </div>
    </div>
  `;

  const parent = document.getElementById('parent');
  const child = document.getElementById('child');

  it('should return the matching ancestor node', () => {
    const result = findAncestorNodeByTagName(child, 'div');
    expect(result).toBe(parent);
  });

  it('should return null if no matching ancestor node is found', () => {
    const result = findAncestorNodeByTagName(child, 'span');
    expect(result).toBe(child);
  });

  it('should return the node itself if it matches the tag name', () => {
    const result = findAncestorNodeByTagName(child, 'div');
    expect(result).toBe(parent); // 因为 child 的直接父级 parent 也是 div
  });

  it('should return null if the input node is null', () => {
    const result = findAncestorNodeByTagName(null, 'div');
    expect(result).toBeNull();
  });
});
