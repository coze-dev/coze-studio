/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { findLastSiblingNode } from '../src/utils/helper/find-last-sibling-node';

describe('findLastSiblingNode', () => {
  // Setting up the DOM environment
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
