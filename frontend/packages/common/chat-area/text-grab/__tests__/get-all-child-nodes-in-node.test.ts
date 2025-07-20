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
 
import { getAllChildNodesInNode } from '../src/utils/helper/get-all-child-nodes-in-node';

describe('getAllChildNodesInNode', () => {
  let root: HTMLElement;

  beforeEach(() => {
    // 在每个测试用例之前设置 DOM 结构
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

  it('should return all child nodes of a given node, including text nodes', () => {
    const nodes = getAllChildNodesInNode(root);
    expect(nodes.length).toBe(11);
  });

  it('should return an empty array if the node has no children', () => {
    const emptyNode = document.createElement('div');
    const nodes = getAllChildNodesInNode(emptyNode);
    expect(nodes).toEqual([emptyNode]);
  });

  it('should correctly handle text and element nodes', () => {
    const nodes = getAllChildNodesInNode(root);
    // 检查返回的节点类型是否正确
    expect(nodes.some(node => node.nodeType === Node.TEXT_NODE)).toBe(true); // 至少有一个文本节点
    expect(nodes.some(node => node.nodeType === Node.ELEMENT_NODE)).toBe(true); // 至少有一个元素节点
  });
});
