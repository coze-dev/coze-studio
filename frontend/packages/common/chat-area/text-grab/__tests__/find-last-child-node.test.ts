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

import { findLastChildNode } from '../src/utils/helper/find-last-child-node';

describe('findLastChildNode', () => {
  it('should return the last child node of a nested node structure', () => {
    // Create a nested node structure
    const parentNode = document.createElement('div');
    const childNode1 = document.createElement('span');
    const childNode2 = document.createElement('p');
    const lastChildNode = document.createElement('a');

    parentNode.appendChild(childNode1);
    childNode1.appendChild(childNode2);
    childNode2.appendChild(lastChildNode);

    // Call the findLastChildNode function
    const result = findLastChildNode(parentNode);

    // Verify that the result is the deepest sub-node
    expect(result).toBe(lastChildNode);
  });

  it('should return the node itself if it has no children', () => {
    // Create a node without a sub-node
    const singleNode = document.createElement('div');

    // Call the findLastChildNode function
    const result = findLastChildNode(singleNode);

    // Verify whether the result is the node itself
    expect(result).toBe(singleNode);
  });
});
