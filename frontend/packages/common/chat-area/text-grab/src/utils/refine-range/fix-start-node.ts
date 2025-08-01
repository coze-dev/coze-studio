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

export const fixStartNode = ({
  range,
  targetAttributeName,
  targetAttributeValue,
}: {
  range: Range;
  targetAttributeName: string;
  targetAttributeValue: string;
}) => {
  let startNode: Node | null = range.startContainer;
  let { startOffset } = range;

  // Make sure the starting node meets the requirements
  while (
    startNode &&
    !(
      getAncestorAttributeValue(startNode, targetAttributeName) ===
      targetAttributeValue
    )
  ) {
    if (startNode.previousSibling) {
      startNode = startNode.previousSibling;
      startOffset = 0; // From the starting position of the previous sibling node
    } else if (startNode.parentNode && startNode.parentNode !== document) {
      startNode = startNode.parentNode;
      startOffset = 0; // Start at the beginning of the parent node
    } else {
      // No eligible starting nodes
      startNode = null;
      break;
    }
  }

  return {
    startNode,
    startOffset,
  };
};
