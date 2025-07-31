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

import { processSpecialNode } from '../process-node/process-special-node';
import {
  GrabElementType,
  type GrabLinkElement,
  type GrabImageElement,
  type GrabNode,
  type GrabText,
} from '../../types/node';

/**
 * Get formatted NodeList
 * @param childNodeList NodeListOf<Node>
 */
export const getNormalizeNodeList = (childNodeList: NodeListOf<Node>) => {
  const normalizedNodeList: GrabNode[] = [];

  if (!childNodeList.length) {
    return normalizedNodeList;
  }

  for (const childNode of childNodeList) {
    const specialNode = processSpecialNode(childNode);

    if (specialNode) {
      const grabNode = generateGrabNode(specialNode);

      grabNode && normalizedNodeList.push(grabNode);
      continue;
    } else {
      const grabNode = generateGrabNode(childNode);
      grabNode && normalizedNodeList.push(grabNode);
    }

    const normalizedNodeListInLoop = getNormalizeNodeList(childNode.childNodes);
    normalizedNodeList.push(...normalizedNodeListInLoop);
  }

  return normalizedNodeList;
};

/**
 * Generating Grab Nodes
 * @param node Node | null
 */
export const generateGrabNode = (node: Node | null) => {
  if (!node) {
    return null;
  }

  const isTable = ['TH', 'TD'].includes(node.nodeName.toUpperCase());

  // text node
  if (node.nodeType === node.TEXT_NODE || isTable) {
    return generateGrabText(node, isTable);
  }

  // element node
  if (node.nodeType === node.ELEMENT_NODE && node instanceof Element) {
    return generateGrabElement(node);
  }
};

/**
 * Generate Text Node
 * @param node Node | null
 */
export const generateGrabText = (node: Node | null, isTable?: boolean) => {
  if (!node) {
    return;
  }

  const safeTextContent = node.textContent ?? '';

  const text = isTable ? ` ${safeTextContent} ` : safeTextContent;

  const grabText: GrabText = {
    text,
  };

  return grabText;
};

/**
 * Generating Element Node
 * @param node Element | null
 */
export const generateGrabElement = (node: Element | null) => {
  if (!node) {
    return;
  }

  if (['IMG', 'SOURCE'].includes(node.tagName.toUpperCase())) {
    const grabText = generateGrabText(node);

    const grabImageElement: GrabImageElement = {
      type: GrabElementType.IMAGE,
      src: 'src' in node && typeof node.src === 'string' ? node.src : '',
      children: grabText ? [grabText] : [],
    };

    return grabImageElement;
  }

  if (node.tagName.toUpperCase() === 'A') {
    const grabText = generateGrabText(node);
    const grabLinkElement: GrabLinkElement = {
      type: GrabElementType.LINK,
      url: 'href' in node && typeof node.href === 'string' ? node.href : '',
      children: grabText ? [grabText] : [],
    };

    return grabLinkElement;
  }
};
