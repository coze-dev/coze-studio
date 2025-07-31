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

/**
 * Find ancestor nodes (including itself) by TagName
 * @param node Node | null
 * @param tagName Target tagName
 * @returns Node | null
 */
export const findAncestorNodeByTagName = (
  node: Node | null,
  tagName: string,
): Element | null => {
  // Convert the tag signature to uppercase, as tag signatures in the DOM are usually uppercase
  const upperTagName = tagName.toUpperCase();

  // Traverse the node's ancestors until a matching tag is found or the root node is reached
  while (node) {
    // Make sure that the current node is an element node and that the tag signatures match
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).tagName === upperTagName
    ) {
      return node as Element;
    }
    // Move to Parent Node
    node = node.parentNode;
  }

  // If no eligible ancestor is found, return null.
  return null;
};
