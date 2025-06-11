import { findLastSiblingNode } from '../src/utils/helper/find-last-sibling-node';

describe('findLastSiblingNode', () => {
  // 设置 DOM 环境
  document.body.innerHTML = `
    <div id="ancestor">
      <div id="sibling1" data-scope="valid"></div>
      <div id="sibling2" data-scope="invalid"></div>
      <div id="sibling3" data-scope="valid"></div>
      <div id="sibling4" data-scope="valid"></div>
    </div>
  `;

  const sibling1 = document.getElementById('sibling1');
  const sibling4 = document.getElementById('sibling4');

  it('should return the last sibling node that meets the condition', () => {
    const result = findLastSiblingNode({
      node: sibling1,
      scopeAncestorAttributeName: 'data-scope',
      targetAttributeValue: 'valid',
    });
    expect(result).toBe(sibling4);
  });

  it('should return null if no sibling node meets the condition', () => {
    const result = findLastSiblingNode({
      node: sibling1,
      scopeAncestorAttributeName: 'data-scope',
      targetAttributeValue: 'hhhh',
    });
    expect(result).toBeNull();
  });

  it('should return null when the scopeAncestorAttributeName is not provided', () => {
    const result = findLastSiblingNode({
      node: sibling1,
      targetAttributeValue: 'valid',
    });
    expect(result).toBeNull();
  });
});
