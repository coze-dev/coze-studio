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

import { type GrabNode } from '../../types/node';
import { isGrabTextNode } from './is-grab-text-node';
import { isGrabLink } from './is-grab-link';
import { isGrabImage } from './is-grab-image';

/**
 * Access to user-friendly text content
 */
export const getHumanizedContentText = (normalizeNodeList: GrabNode[]) => {
  let content = '';

  for (const node of normalizeNodeList) {
    if (isGrabTextNode(node)) {
      content += node.text;
    } else if (isGrabLink(node)) {
      content += `[${getHumanizedContentText(node.children)}]`;
    } else if (isGrabImage(node)) {
      content += `![${getHumanizedContentText(node.children)}]`;
    } else {
      content += getHumanizedContentText(node.children);
    }
  }

  return content;
};
