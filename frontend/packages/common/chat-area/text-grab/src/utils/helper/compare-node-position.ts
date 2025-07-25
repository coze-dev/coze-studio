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
 * 判断节点包含关系
 * 参考文档「https://developer.mozilla.org/zh-CN/docs/Web/API/Node/compareDocumentPosition」
 * @param nodeA
 * @param nodeB
 *
 */
export const compareNodePosition = (nodeA: Node, nodeB: Node) => {
  const comparison = nodeA.compareDocumentPosition(nodeB);

  // 之所以条件跟返回是反的，请参考官方文档，包含关系展示的是B - A的关系
  if (comparison & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return 'contains'; // nodeA 包含 nodeB
  } else if (comparison & Node.DOCUMENT_POSITION_CONTAINS) {
    return 'containedBy'; // nodeA 被 nodeB 包含
  } else if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) {
    return 'before'; // nodeA 在 nodeB 之前
  } else if (comparison & Node.DOCUMENT_POSITION_PRECEDING) {
    return 'after'; // nodeA 在 nodeB 之后
  }

  return 'none'; // 节点是相同的或者没有可比较的关系
};
