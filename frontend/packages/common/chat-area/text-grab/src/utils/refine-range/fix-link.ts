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

import { findNearestAnchor } from '../helper/find-nearest-link-node';

export const fixLink = (range: Range, startNode: Node, endNode: Node) => {
  const startAnchor = findNearestAnchor(startNode);
  const endAnchor = findNearestAnchor(endNode);

  let isFix = false;
  // If the starting node is within the link, set the starting point of the selection to the start of the link
  if (startAnchor) {
    range.setStartBefore(startAnchor);
    isFix = true;
  }

  // If the end node is within the link, set the end of the selection to the end of the link
  if (endAnchor) {
    range.setEndAfter(endAnchor);
    isFix = true;
  }

  return isFix;
};

/**
 * 1. Link [A... text... link] to B
 * 2. Link A... text [word... link] to B
 * 3.... Text [word, chain] to B
 * 4. Chain [link] B
 */
