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

import { processSpecialNode } from './process-special-node';

export const processChildNode = (childNodes: NodeListOf<Node>) => {
  const childNodeList: Node[] = [];

  if (!childNodes.length) {
    return;
  }

  for (const childNode of childNodes) {
    const specialNode = processSpecialNode(childNode);

    if (specialNode) {
      childNodeList.push(specialNode);
      continue;
    }

    const result = processChildNode(childNode.childNodes);

    if (!result) {
      childNodeList.push(childNode);
      continue;
    }

    childNodeList.push(...result);
  }

  return childNodeList;
};
