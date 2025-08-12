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

import { getAllNodesInRange } from '../src/utils/helper/get-all-nodes-in-range';

describe('getAllNodesInRange', () => {
  let root: HTMLElement;

  beforeEach(() => {
    // Setting up the DOM structure before each test case
    document.body.innerHTML = `
      <div id="root">
        <span>Text 1</span>
        <div>
          <p>Text 2</p>
        </div>
        Text 3
      </div>
    `;
    root = document.getElementById('root') as HTMLElement;
  });

  it('should return all nodes within a range, including text and element nodes', () => {
    const range = new Range();
    range.setStart(root, 0); // Setup scope starts at the first sub-node of root
    range.setEnd(root, 3); // The setting range ends at the last sub-node of root.

    const nodes = getAllNodesInRange(range);
    // Expected to include: span, div, Text 3
    expect(nodes.length).toBe(5);
    expect((nodes[0] as Node).nodeType).toBe(Node.ELEMENT_NODE); // span
    expect((nodes[1] as Node).nodeType).toBe(Node.TEXT_NODE); // text
    expect((nodes[2] as Node).nodeType).toBe(Node.ELEMENT_NODE); // span
    expect((nodes[3] as Node).nodeType).toBe(Node.TEXT_NODE); // text
    expect((nodes[4] as Node).nodeType).toBe(Node.TEXT_NODE); // Text 3
  });

  it('should return an empty array if the range is collapsed', () => {
    const range = document.createRange();
    range.setStart(root, 1); // Set the start and end of the range at the same location
    range.setEnd(root, 1); // This will create a collapsed scope that contains no nodes

    const nodes = getAllNodesInRange(range);
    expect(nodes).toEqual([root]);
  });

  it('should correctly handle a range that only includes a text node', () => {
    const textNode = root.childNodes[2] as ChildNode; // Text 3
    const range = document.createRange();
    range.setStartBefore(textNode);
    range.setEndAfter(textNode);

    const nodes = getAllNodesInRange(range);
    expect(nodes.length).toBe(2);
    expect((nodes[0] as Node).nodeType).toBe(Node.ELEMENT_NODE); // Text 3
    expect((nodes[1] as Node).nodeType).toBe(Node.TEXT_NODE); // Text 3
  });
});
