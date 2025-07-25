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
 
import { findPictureValidChildNode } from '../find-picture-valid-child-node';

/**
 * 处理特殊 Node 节点数据
 * @param node Node
 * @returns node | undefined
 */
export const processSpecialNode = (node: Node) => {
  // 针对picture类型的特殊优化
  if (node.nodeName.toUpperCase() === 'PICTURE') {
    const pictureNode = findPictureValidChildNode(node.childNodes);

    if (pictureNode) {
      return pictureNode;
    }
  }

  // 针对链接的特殊优化
  if (node.nodeName.toUpperCase() === 'A') {
    return node;
  }

  // 针对表格的特殊优化
  if (['TH', 'TD'].includes(node.nodeName.toUpperCase())) {
    return node;
  }

  return;
};
