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

// Helper function to obtain all nodes in the selection
export const getAllNodesInRange = (range: Range): Node[] => {
  const nodes: Node[] = [];
  const treeWalker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ALL,
    {
      acceptNode: node =>
        range.intersectsNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    },
  );

  // eslint-disable-next-line prefer-destructuring -- as expected, because the data is to be changed and allowed to be empty
  let currentNode: Node | null = treeWalker.currentNode;

  while (currentNode) {
    nodes.push(currentNode);
    currentNode = treeWalker.nextNode();
  }

  return nodes;
};
