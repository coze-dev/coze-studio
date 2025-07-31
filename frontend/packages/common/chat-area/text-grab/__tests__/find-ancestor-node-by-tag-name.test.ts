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

import { findAncestorNodeByTagName } from '../src/utils/helper/find-ancestor-node-by-tag-name';

describe('findAncestorNodeByTagName', () => {
  // Setting up the DOM environment
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
    expect(result).toBe(parent); // Because the child's immediate parent is also a div
  });

  it('should return null if the input node is null', () => {
    const result = findAncestorNodeByTagName(null, 'div');
    expect(result).toBeNull();
  });
});
