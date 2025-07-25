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
 
export const findNearestAnchor = (
  node: Node | null,
): HTMLAnchorElement | null => {
  // 从当前节点开始向上遍历
  while (node) {
    // 如果当前节点是元素节点并且是<a>标签
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'A') {
      // 返回这个<a>标签
      return node as HTMLAnchorElement;
    }
    // 向上移动到父节点
    node = node.parentNode;
  }
  // 如果遍历到根节点还没有找到<a>标签，返回null
  return null;
};
