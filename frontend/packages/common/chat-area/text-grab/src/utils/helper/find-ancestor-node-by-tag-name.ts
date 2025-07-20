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
 * 通过 TagName 寻找祖先节点(包括自身)
 * @param node Node | null
 * @param tagName 目标 tagName
 * @returns Node | null
 */
export const findAncestorNodeByTagName = (
  node: Node | null,
  tagName: string,
): Element | null => {
  // 将标签名转换为大写，因为 DOM 中的标签名通常是大写的
  const upperTagName = tagName.toUpperCase();

  // 遍历节点的祖先节点直到找到匹配的标签名或到达根节点
  while (node) {
    // 确保当前节点是元素节点，并且标签名匹配
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).tagName === upperTagName
    ) {
      return node as Element;
    }
    // 移动到父节点
    node = node.parentNode;
  }

  // 如果没有找到符合条件的祖先节点，返回 null
  return null;
};
