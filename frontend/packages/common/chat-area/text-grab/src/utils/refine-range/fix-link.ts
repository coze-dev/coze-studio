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
  // 如果起始节点在链接内，将选区的起点设置为链接的开始
  if (startAnchor) {
    range.setStartBefore(startAnchor);
    isFix = true;
  }

  // 如果结束节点在链接内，将选区的终点设置为链接的结束
  if (endAnchor) {
    range.setEndAfter(endAnchor);
    isFix = true;
  }

  return isFix;
};

/**
 * 1. 链接[A ...文字... 链]接B
 * 2. 链接A ...文[字... 链]接B
 * 3. ...文[字 链]接B
 * 4. 链[接]B
 */
