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
 * Fix the actual function of the selection
 * @param range Range
 */
import { findLastSiblingNode } from '../helper/find-last-sibling-node';
import { findLastChildNode } from '../helper/find-last-child-node';
import { findAncestorNodeByTagName } from '../helper/find-ancestor-node-by-tag-name';
import { compareNodePosition } from '../helper/compare-node-position';
import { getAncestorAttributeValue } from '../get-ancestor-attribute-value';
import { CONTENT_ATTRIBUTE_NAME } from '../../constants/range';
import { fixStartNode } from './fix-start-node';
import { fixLink } from './fix-link';
import { fixEndNode } from './fix-end-node';
import { fixEndEmpty } from './fix-end-empty';

// eslint-disable-next-line complexity
export const refineRange = ({ range }: { range: Range }): boolean => {
  // The initial algorithm only uses StartNode as the starting node of the selection
  const targetAttributeValue = getAncestorAttributeValue(
    range.startContainer,
    CONTENT_ATTRIBUTE_NAME,
  );

  if (!targetAttributeValue) {
    return false;
  }

  const { startNode, startOffset } = fixStartNode({
    range,
    targetAttributeName: CONTENT_ATTRIBUTE_NAME,
    targetAttributeValue,
  });

  let { endNode, endOffset } = fixEndNode({
    range,
    targetAttributeName: CONTENT_ATTRIBUTE_NAME,
    targetAttributeValue,
  });

  // If the start node is found, but the end node is not found, then continue to try to fix the selection using the last sibling of the start node
  if (startNode && !endNode) {
    const { parentNode } = startNode;
    let lastSibling: Node | null = null;

    // Try to find the nearest < li > or < a > tag
    const liParentNode = findAncestorNodeByTagName(parentNode, 'LI');
    const aParentNode = liParentNode
      ? findAncestorNodeByTagName(liParentNode, 'A')
      : findAncestorNodeByTagName(parentNode, 'A');
    // Find the nearest < div > tag
    const divParentNode = findAncestorNodeByTagName(parentNode, 'DIV');

    // Determine how to find the last sibling based on the type of node found
    if (aParentNode) {
      // If < a > is found, use its parent node
      lastSibling = findLastSiblingNode({
        node: aParentNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    } else if (liParentNode) {
      // If a < li > is found, use its parent node
      lastSibling = findLastSiblingNode({
        node: liParentNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    } else if (divParentNode) {
      // If a < div > is found, use its parent node (e.g. in the case of a code block).
      lastSibling = findLastSiblingNode({
        node: divParentNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    } else {
      // Otherwise, use the starting node
      lastSibling = findLastSiblingNode({
        node: startNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    }

    // If the starting node is the same as the found sibling, then use the parent element of the actual node to find its last node
    if (startNode === lastSibling) {
      lastSibling = findLastSiblingNode({
        node: parentNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    }

    if (lastSibling) {
      endNode = lastSibling;
      endOffset =
        endNode.nodeType === Node.TEXT_NODE
          ? (endNode as Text).length
          : findLastChildNode(endNode).textContent?.length ?? 0;
    }
  }

  // If both the start and end nodes are found, correct the selection
  if (startNode && endNode) {
    const relation = compareNodePosition(startNode, endNode);

    let isFix = false;

    if (['before', 'none'].includes(relation)) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);

      isFix = true;
    }

    const isFixLink = fixLink(range, startNode, endNode);

    const isFixEndEmpty = fixEndEmpty({ range, startNode, endNode, endOffset });

    return isFix || isFixLink || isFixEndEmpty;
  }

  range.collapse(false);
  return false;
};
