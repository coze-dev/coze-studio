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
