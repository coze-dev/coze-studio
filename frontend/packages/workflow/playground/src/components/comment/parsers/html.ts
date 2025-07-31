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

/* eslint-disable @typescript-eslint/no-magic-numbers -- no need */
/* eslint-disable @typescript-eslint/no-namespace -- namespace is necessary */

import type { CommentEditorBlock, CommentEditorLeaf } from '../type';
import { CommentEditorBlockFormat, CommentEditorLeafFormat } from '../constant';

export namespace CommentEditorHTMLParser {
  // Convert leaf nodes to HTML
  const convertLeafToHtml = (leaf: CommentEditorLeaf): string => {
    let result: string = leaf.text;

    if (leaf[CommentEditorLeafFormat.Bold]) {
      result = `<strong>${result}</strong>`;
    }
    if (leaf[CommentEditorLeafFormat.Italic]) {
      result = `<em>${result}</em>`;
    }
    if (leaf[CommentEditorLeafFormat.Underline]) {
      result = `<u>${result}</u>`;
    }
    if (leaf[CommentEditorLeafFormat.Strikethrough]) {
      result = `<del>${result}</del>`;
    }
    if (leaf[CommentEditorLeafFormat.Link]) {
      result = `<a href="${leaf[CommentEditorLeafFormat.Link]}">${result}</a>`;
    }

    return result;
  };

  // Convert paragraphs to HTML
  const convertParagraphToHtml = (block: CommentEditorBlock): string => {
    const content: string = block.children
      .map(child => {
        if ('text' in child) {
          return convertLeafToHtml(child);
        }
        return convertBlockToHtml(child);
      })
      .join('');
    return `<p>${content}</p>`;
  };

  // Convert title to HTML
  const convertHeadingToHtml = (block: CommentEditorBlock): string => {
    const content: string = block.children
      .map(child => {
        if ('text' in child) {
          return convertLeafToHtml(child);
        }
        return '';
      })
      .join('');
    const level: number =
      block.type === CommentEditorBlockFormat.HeadingOne
        ? 1
        : block.type === CommentEditorBlockFormat.HeadingTwo
        ? 2
        : 3;
    return `<h${level}>${content}</h${level}>`;
  };

  // Convert reference to HTML
  const convertBlockquoteToHtml = (block: CommentEditorBlock): string => {
    // Process the content in the reference block
    const processQuoteContent = (
      child: CommentEditorLeaf | CommentEditorBlock,
    ): string => {
      if ('text' in child) {
        return convertLeafToHtml(child);
      }
      return convertBlockToHtml(child);
    };

    // Handle all child elements
    const content: string = block.children.map(processQuoteContent).join('');

    // Wrap the content inside a < p > tag, then put in a < blockquote > tag
    return `<blockquote><p>${content}</p></blockquote>`;
  };

  // Convert list to HTML
  const convertListToHtml = (block: CommentEditorBlock): string => {
    const isNumbered: boolean =
      block.type === CommentEditorBlockFormat.NumberedList;
    const listTag: string = isNumbered ? 'ol' : 'ul';

    const content: string = block.children
      .map(child => {
        if (
          'type' in child &&
          child.type === CommentEditorBlockFormat.ListItem
        ) {
          const itemContent: string = child.children
            .map(grandChild => {
              if ('text' in grandChild) {
                return convertLeafToHtml(grandChild);
              }
              if (
                grandChild.type === CommentEditorBlockFormat.BulletedList ||
                grandChild.type === CommentEditorBlockFormat.NumberedList
              ) {
                return convertListToHtml(grandChild);
              }
              return '';
            })
            .join('');

          return `<li>${itemContent}</li>`;
        }
        return '';
      })
      .join('');

    return `<${listTag}>${content}</${listTag}>`;
  };

  // Convert block to HTML
  const convertBlockToHtml = (block: CommentEditorBlock): string => {
    switch (block.type) {
      case CommentEditorBlockFormat.Paragraph:
        return convertParagraphToHtml(block);
      case CommentEditorBlockFormat.HeadingOne:
      case CommentEditorBlockFormat.HeadingTwo:
      case CommentEditorBlockFormat.HeadingThree:
        return convertHeadingToHtml(block);
      case CommentEditorBlockFormat.Blockquote:
        return convertBlockquoteToHtml(block);
      case CommentEditorBlockFormat.BulletedList:
      case CommentEditorBlockFormat.NumberedList:
        return convertListToHtml(block);
      default:
        return '';
    }
  };

  // Main function: Converts the entire schema to HTML
  export const to = (schema: CommentEditorBlock[]): string => {
    const html: string = schema
      .map(block => convertBlockToHtml(block))
      .join('');
    return html;
  };
}
