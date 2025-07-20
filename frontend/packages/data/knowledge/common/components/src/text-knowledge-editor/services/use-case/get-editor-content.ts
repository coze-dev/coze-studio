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
 
import { type Editor } from '@tiptap/react';

/**
 * 获取编辑器内容
 * 返回用户真实编辑的内容，移除TipTap自动添加的外层<p>标签
 */
export const getEditorContent = (editor: Editor | null) => {
  if (!editor) {
    return '';
  }

  const content = editor.isEmpty ? '' : editor.getHTML();

  const doc = removeEditorWrapperParagraph(content);

  // 返回处理后的HTML
  return doc;
};

/**
 * 处理编辑器输出的HTML内容
 * 移除不必要的外层<p>标签，保持与原始内容格式一致
 */
export const removeEditorWrapperParagraph = (content: string): string => {
  if (!content) {
    return '';
  }

  // 使用DOM解析器来处理HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  // 找到所有编辑器生成的p标签
  const generatedParagraphs = doc.querySelectorAll(
    'p.text-knowledge-tiptap-editor-paragraph',
  );

  // 替换这些p标签为它们的内容
  generatedParagraphs.forEach(p => {
    const parent = p.parentNode;
    if (parent) {
      // 创建一个文档片段来存储p标签的内容
      const fragment = document.createDocumentFragment();
      while (p.firstChild) {
        fragment.appendChild(p.firstChild);
      }
      // 用内容替换p标签
      parent.replaceChild(fragment, p);
    }
  });

  return doc.body.innerHTML;
};
