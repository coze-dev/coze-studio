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

import { compareNodePosition } from '../src/utils/helper/compare-node-position';

describe('compareNodePosition', () => {
  let parentNode: HTMLElement;
  let childNode: HTMLElement;
  let siblingNode: HTMLElement;

  beforeEach(() => {
    // Create a new DOM structure before each test
    parentNode = document.createElement('div');
    childNode = document.createElement('span');
    siblingNode = document.createElement('p');
    parentNode.appendChild(childNode); // childNode is a sub-node of parentNode
    parentNode.appendChild(siblingNode); // siblingNode is a sibling of childNode
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
