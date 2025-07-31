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

export const findNearestAnchor = (
  node: Node | null,
): HTMLAnchorElement | null => {
  // Traverse up from the current node
  while (node) {
    // If the current node is an element node and is a < a > tag
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'A') {
      // Return this < a > tag
      return node as HTMLAnchorElement;
    }
    // Move up to the parent node
    node = node.parentNode;
  }
  // If the < a > tag is not found at the root node, return null.
  return null;
};
