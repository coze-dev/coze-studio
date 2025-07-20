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
 * 修复选区的实际函数
 * @param range Range 选区
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
  // 初期算法只用StartNode当作选区的开始节点
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

  // 如果找到了起始节点，但是没找到结束节点，那么继续尝试使用开始节点的最后一个兄弟元素修复选区
  if (startNode && !endNode) {
    const { parentNode } = startNode;
    let lastSibling: Node | null = null;

    // 尝试找到最近的<li>或<a>标签
    const liParentNode = findAncestorNodeByTagName(parentNode, 'LI');
    const aParentNode = liParentNode
      ? findAncestorNodeByTagName(liParentNode, 'A')
      : findAncestorNodeByTagName(parentNode, 'A');
    // 找到最近的<div>标签
    const divParentNode = findAncestorNodeByTagName(parentNode, 'DIV');

    // 根据找到的节点类型决定如何查找最后一个兄弟节点
    if (aParentNode) {
      // 如果找到了<a>，使用它的父节点
      lastSibling = findLastSiblingNode({
        node: aParentNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    } else if (liParentNode) {
      // 如果找到了<li>，使用它的父节点
      lastSibling = findLastSiblingNode({
        node: liParentNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    } else if (divParentNode) {
      // 如果找到了<div>，使用他的父节点（例如代码块的情况）
      lastSibling = findLastSiblingNode({
        node: divParentNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    } else {
      // 否则，使用起始节点
      lastSibling = findLastSiblingNode({
        node: startNode,
        scopeAncestorAttributeName: CONTENT_ATTRIBUTE_NAME,
        targetAttributeValue,
      });
    }

    // 如果起始节点和找到的兄弟节点一样，那么就用其实节点的父元素去找他最后的一个节点
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

  // 如果起始节点和结束节点都找到了，修正选区
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
