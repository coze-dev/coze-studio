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
 
export const hasVisibleSelection = (range: Range): boolean => {
  // 克隆Range内的所有节点
  const documentFragment = range.cloneContents();
  const textNodes: Text[] = [];

  // 递归函数来收集所有文本节点
  function collectTextNodes(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    } else {
      node.childNodes.forEach(collectTextNodes);
    }
  }

  // 从文档片段的根节点开始收集文本节点
  collectTextNodes(documentFragment);

  // 检查收集到的文本节点中是否有非空白的文本
  return textNodes.some(textNode => /\S/.test(textNode.textContent || ''));
};
