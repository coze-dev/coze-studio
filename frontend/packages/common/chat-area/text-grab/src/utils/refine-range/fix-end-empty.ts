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
 
import { getAllChildNodesInNode } from '../helper/get-all-child-nodes-in-node';
import { findNotContainsPreviousSibling } from '../helper/find-not-contains-previous-sibling';

export const fixEndEmpty = ({
  range,
  startNode,
  endNode,
  endOffset,
}: {
  range: Range;
  startNode: Node;
  endNode: Node;
  endOffset: number;
}): boolean => {
  // 检查是否需要修复：结束节点和开始节点不同且结束偏移量为0
  if (startNode === endNode || endOffset !== 0) {
    return false; // 不需要修复
  }

  // 初始化当前节点为结束节点的前一个兄弟节点
  let currentNode: Node | null = findNotContainsPreviousSibling(endNode);

  // 寻找一个有效的非空前一个兄弟节点
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      // 如果是文本节点，检查是否非空
      const textContent = currentNode.textContent?.trim();
      if (textContent && currentNode.textContent?.length) {
        // 非空，修复选区结束位置
        range.setEnd(currentNode, currentNode.textContent.length);
        return true;
      }
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      // 如果是元素节点，检查是否有可见内容
      const textContent = currentNode.textContent?.trim();
      if (textContent) {
        // 有可见内容，尝试更精确地设置结束位置
        // 如果元素内部有文本节点，尝试定位到最后一个文本节点
        let lastTextNode: Node | null = null;

        const allChildNodes = getAllChildNodesInNode(currentNode);

        for (const child of allChildNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            lastTextNode = child as Node;
          }
        }

        if (lastTextNode && lastTextNode.textContent) {
          range.setEnd(lastTextNode, lastTextNode.textContent.length);
          return true;
        }
      }
    }
    // 如果当前节点为空或不满足条件，继续向前/向上遍历
    currentNode = findNotContainsPreviousSibling(currentNode);
  }

  // 如果遍历完所有前一个兄弟节点都没有找到合适的节点，返回false
  return false;
};
