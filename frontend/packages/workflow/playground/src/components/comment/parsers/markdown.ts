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

export namespace CommentEditorMarkdownParser {
  // Convert leaf nodes to Markdown
  const convertLeafToMarkdown = (leaf: CommentEditorLeaf): string => {
    let result: string = leaf.text;

    if (leaf[CommentEditorLeafFormat.Bold]) {
      result = `**${result}**`;
    }
    if (leaf[CommentEditorLeafFormat.Italic]) {
      result = `*${result}*`;
    }
    if (leaf[CommentEditorLeafFormat.Underline]) {
      result = `__${result}__`;
    }
    if (leaf[CommentEditorLeafFormat.Strikethrough]) {
      result = `~~${result}~~`;
    }
    if (leaf[CommentEditorLeafFormat.Link]) {
      result = `[${result}](${leaf[CommentEditorLeafFormat.Link]})`;
    }

    return result;
  };

  // Convert paragraphs to Markdown
  const convertParagraphToMarkdown = (block: CommentEditorBlock): string => {
    const content: string = block.children
      .map(child => {
        if ('text' in child) {
          return convertLeafToMarkdown(child);
        }
        return convertBlockToMarkdown(child);
      })
      .join('');
    return `${content}\n\n`;
  };

  // Convert headings to Markdown
  const convertHeadingToMarkdown = (block: CommentEditorBlock): string => {
    const content: string = block.children
      .map(child => {
        if ('text' in child) {
          return convertLeafToMarkdown(child);
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
    return `${'#'.repeat(level)} ${content}\n\n`;
  };

  // Convert Reference to Markdown
  const convertBlockquoteToMarkdown = (block: CommentEditorBlock): string => {
    // Process the content in the reference block
    const processQuoteContent = (
      child: CommentEditorLeaf | CommentEditorBlock,
    ): string => {
      if ('text' in child) {
        return convertLeafToMarkdown(child);
      }
      if (child.type === CommentEditorBlockFormat.Paragraph) {
        return convertParagraphToMarkdown(child).trimEnd();
      }
      return convertBlockToMarkdown(child);
    };

    // Convert content to citation format
    const convertToQuoteFormat = (content: string): string =>
      content
        .split('\n')
        .map((line: string): string => `> ${line}`)
        .join('\n');

    // Handle all child elements
    const content: string = block.children
      .map(processQuoteContent)
      .join('\n')
      .trim();

    // Convert to reference format and add extra line breaks
    return `${convertToQuoteFormat(content)}\n\n`;
  };

  // Convert List to Markdown
  const convertListToMarkdown = (
    block: CommentEditorBlock,
    indent = '',
  ): string => {
    const isNumbered: boolean =
      block.type === CommentEditorBlockFormat.NumberedList;
    let index = 1;

    const content: string = block.children
      .map(child => {
        if (
          'type' in child &&
          child.type === CommentEditorBlockFormat.ListItem
        ) {
          const itemContent: string = child.children
            .map(grandChild => {
              if ('text' in grandChild) {
                return convertLeafToMarkdown(grandChild);
              }
              if (
                grandChild.type === CommentEditorBlockFormat.BulletedList ||
                grandChild.type === CommentEditorBlockFormat.NumberedList
              ) {
                return convertListToMarkdown(grandChild, `${indent}  `);
              }
              return '';
            })
            .join('');

          const prefix: string = isNumbered ? `${index}. ` : '- ';
          index++;
          return `${indent}${prefix}${itemContent}\n`;
        }
        return '';
      })
      .join('');

    return `${content}\n`;
  };

  // Convert block to Markdown
  const convertBlockToMarkdown = (block: CommentEditorBlock): string => {
    switch (block.type) {
      case CommentEditorBlockFormat.Paragraph:
        return convertParagraphToMarkdown(block);
      case CommentEditorBlockFormat.HeadingOne:
      case CommentEditorBlockFormat.HeadingTwo:
      case CommentEditorBlockFormat.HeadingThree:
        return convertHeadingToMarkdown(block);
      case CommentEditorBlockFormat.Blockquote:
        return convertBlockquoteToMarkdown(block);
      case CommentEditorBlockFormat.BulletedList:
      case CommentEditorBlockFormat.NumberedList:
        return convertListToMarkdown(block);
      default:
        return '';
    }
  };

  // Main function: Converts the entire schema to Markdown
  export const to = (schema: CommentEditorBlock[]): string => {
    const markdown: string = schema
      .map(block => convertBlockToMarkdown(block))
      .join('');
    return markdown.trim();
  };
}
