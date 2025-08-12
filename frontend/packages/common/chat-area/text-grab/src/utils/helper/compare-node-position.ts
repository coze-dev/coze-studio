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
 * Determine the node inclusion relationship
 * Reference document "https://developer.mozilla.org/zh-CN/docs/Web/API/Node/compareDocumentPosition"
 * @param nodeA
 * @param nodeB
 *
 */
export const compareNodePosition = (nodeA: Node, nodeB: Node) => {
  const comparison = nodeA.compareDocumentPosition(nodeB);

  // The reason why the condition is inverse to return, please refer to the official documentation, including the relationship showing the B-A relationship
  if (comparison & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return 'contains'; // NodeA contains nodeB
  } else if (comparison & Node.DOCUMENT_POSITION_CONTAINS) {
    return 'containedBy'; // NodeA is contained by nodeB
  } else if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) {
    return 'before'; // nodeA before nodeB
  } else if (comparison & Node.DOCUMENT_POSITION_PRECEDING) {
    return 'after'; // NodeA after nodeB
  }

  return 'none'; // Nodes are the same or have no comparable relationship
};
