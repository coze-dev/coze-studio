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

import { getAncestorAttributeValue } from '../get-ancestor-attribute-value';

/**
 * Find the last sibling of a node
 * @param node find node
 * @returns
 */
export const findLastSiblingNode = ({
  node,
  scopeAncestorAttributeName,
  targetAttributeValue,
}: {
  node: Node | null;
  scopeAncestorAttributeName?: string;
  targetAttributeValue?: string | null;
}): Node | null => {
  let lastValidSibling: Node | null = null;
  while (node) {
    if (
      scopeAncestorAttributeName &&
      getAncestorAttributeValue(node, scopeAncestorAttributeName) ===
        targetAttributeValue
    ) {
      lastValidSibling = node;
    }
    node = node.nextSibling;
  }
  return lastValidSibling;
};
