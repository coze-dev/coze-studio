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
 * Get editor content
 * Return the user's actual edited content and remove the outer < p > tag automatically added by TipTap
 */
export const getEditorContent = (editor: Editor | null) => {
  if (!editor) {
    return '';
  }

  const content = editor.isEmpty ? '' : editor.getHTML();

  const doc = removeEditorWrapperParagraph(content);

  // Returns the processed HTML.
  return doc;
};

/**
 * Process the HTML content output by the editor
 * Remove unnecessary outer < p > tags to maintain the original content format
 */
export const removeEditorWrapperParagraph = (content: string): string => {
  if (!content) {
    return '';
  }

  // Using a DOM parser to process HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');

  // Find all editor-generated p tags
  const generatedParagraphs = doc.querySelectorAll(
    'p.text-knowledge-tiptap-editor-paragraph',
  );

  // Replace these p tags with their content
  generatedParagraphs.forEach(p => {
    const parent = p.parentNode;
    if (parent) {
      // Create a document fragment to store the contents of the p tag
      const fragment = document.createDocumentFragment();
      while (p.firstChild) {
        fragment.appendChild(p.firstChild);
      }
      // Replace p tags with content
      parent.replaceChild(fragment, p);
    }
  });

  return doc.body.innerHTML;
};
