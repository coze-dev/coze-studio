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

export const hasVisibleSelection = (range: Range): boolean => {
  // Clone all nodes within the Range
  const documentFragment = range.cloneContents();
  const textNodes: Text[] = [];

  // Recursive function to collect all text nodes
  function collectTextNodes(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    } else {
      node.childNodes.forEach(collectTextNodes);
    }
  }

  // Collect text nodes from the root node of the document fragment
  collectTextNodes(documentFragment);

  // Check for non-blank text in the collected text nodes
  return textNodes.some(textNode => /\S/.test(textNode.textContent || ''));
};
