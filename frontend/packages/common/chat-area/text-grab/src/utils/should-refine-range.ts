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
 
import { CONTENT_ATTRIBUTE_NAME } from '../constants/range';
import { getAllNodesInRange } from './helper/get-all-nodes-in-range';
import { findAncestorNodeByTagName } from './helper/find-ancestor-node-by-tag-name';
import { getAncestorAttributeValue } from './get-ancestor-attribute-value';

export const shouldRefineRange = (range: Range): boolean => {
  // 获取选区的所有节点
  const nodes = getAllNodesInRange(range);

  let validNodeLength = 0;

  let hasNodeInLink = false;

  // 遍历所有节点，检查它们的祖先是否都有特定类名属性
  for (const node of nodes) {
    const attributeValue = getAncestorAttributeValue(
      node,
      CONTENT_ATTRIBUTE_NAME,
    );

    // 如果不存在才需要覆盖 hasNodeInLink，确保找到有节点在链接中
    if (!hasNodeInLink) {
      hasNodeInLink = Boolean(findAncestorNodeByTagName(node, 'A'));
    }

    if (attributeValue) {
      validNodeLength++;
    }
  }

  const { endOffset } = range;

  return validNodeLength !== nodes.length || hasNodeInLink || endOffset === 0;
};
