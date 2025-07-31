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

import { findLastChildNode } from '../helper/find-last-child-node';
import { getAncestorAttributeValue } from '../get-ancestor-attribute-value';

export const fixEndNode = ({
  range,
  targetAttributeName,
  targetAttributeValue,
}: {
  range: Range;
  targetAttributeName: string;
  targetAttributeValue: string;
}) => {
  let endNode: Node | null = range.endContainer;
  let { endOffset } = range;

  // Make sure the end node meets the conditions
  while (
    endNode &&
    !(
      getAncestorAttributeValue(endNode, targetAttributeName) ===
      targetAttributeValue
    )
  ) {
    if (endNode.nextSibling) {
      endNode = endNode.nextSibling;
      endOffset = 0; // Start from the starting position of the next sibling node
    } else if (endNode.parentNode && endNode.parentNode !== document) {
      endNode = endNode.parentNode;
      endOffset = endNode
        ? findLastChildNode(endNode).textContent?.length ?? 0
        : 0; // Start from the last position of the parent node
    } else {
      // No eligible end nodes
      endNode = null;
      break;
    }
  }

  return {
    endNode,
    endOffset,
  };
};
