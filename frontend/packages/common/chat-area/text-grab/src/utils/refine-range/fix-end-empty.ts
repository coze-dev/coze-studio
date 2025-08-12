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
  // Check if it needs to be fixed: the end node and the start node are different and the end offset is 0
  if (startNode === endNode || endOffset !== 0) {
    return false; // No repair required.
  }

  // Initializes the current node to the previous sibling of the end node
  let currentNode: Node | null = findNotContainsPreviousSibling(endNode);

  // Find a valid non-unprecedented sibling node
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      // If it is a text node, check if it is not empty
      const textContent = currentNode.textContent?.trim();
      if (textContent && currentNode.textContent?.length) {
        // Not empty, fix the end of the selection
        range.setEnd(currentNode, currentNode.textContent.length);
        return true;
      }
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      // If it is an element node, check if there is any visible content
      const textContent = currentNode.textContent?.trim();
      if (textContent) {
        // With visible content, try to set the end position more precisely
        // If there is a text node inside the element, try to navigate to the last text node
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
    // If the current node is empty or does not meet the conditions, continue to traverse forward/upward
    currentNode = findNotContainsPreviousSibling(currentNode);
  }

  // If no suitable node is found after traversing all previous siblings, return false.
  return false;
};
