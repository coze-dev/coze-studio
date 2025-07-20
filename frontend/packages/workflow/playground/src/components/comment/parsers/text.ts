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
 
/* eslint-disable @typescript-eslint/no-namespace -- namespace is necessary */
import type { CommentEditorBlock, CommentEditorLeaf } from '../type';
import { CommentEditorBlockFormat } from '../constant';

export namespace CommentEditorTextParser {
  // 将叶子节点转换为纯文本
  const convertLeafToText = (leaf: CommentEditorLeaf): string => leaf.text;

  // 将段落转换为纯文本
  const convertParagraphToText = (block: CommentEditorBlock): string => {
    const content: string = block.children
      .map(child => {
        if ('text' in child) {
          return convertLeafToText(child);
        }
        return convertBlockToText(child);
      })
      .join('');
    return `${content}\n`;
  };

  // 将标题转换为纯文本
  const convertHeadingToText = (block: CommentEditorBlock): string => {
    const content: string = block.children
      .map(child => {
        if ('text' in child) {
          return convertLeafToText(child);
        }
        return '';
      })
      .join('');
    return `${content}\n`;
  };

  // 将引用转换为纯文本
  const convertBlockquoteToText = (block: CommentEditorBlock): string => {
    const processQuoteContent = (
      child: CommentEditorLeaf | CommentEditorBlock,
    ): string => {
      if ('text' in child) {
        return child.text;
      }
      return convertBlockToText(child);
    };

    const content: string = block.children
      .map(processQuoteContent)
      .join('')
      .trim();

    return `${content}\n`;
  };

  // 将列表转换为纯文本
  const convertListToText = (
    block: CommentEditorBlock,
    indent = '',
  ): string => {
    const content: string = block.children
      .map(child => {
        if (
          'type' in child &&
          child.type === CommentEditorBlockFormat.ListItem
        ) {
          const itemContent: string = child.children
            .map(grandChild => {
              if ('text' in grandChild) {
                return convertLeafToText(grandChild);
              }
              if (
                grandChild.type === CommentEditorBlockFormat.BulletedList ||
                grandChild.type === CommentEditorBlockFormat.NumberedList
              ) {
                return convertListToText(grandChild, `${indent}  `);
              }
              return '';
            })
            .join('');

          return `${indent}${itemContent}\n`;
        }
        return '';
      })
      .join('');

    return content;
  };

  // 将块转换为纯文本
  const convertBlockToText = (block: CommentEditorBlock): string => {
    switch (block.type) {
      case CommentEditorBlockFormat.Paragraph:
        return convertParagraphToText(block);
      case CommentEditorBlockFormat.HeadingOne:
      case CommentEditorBlockFormat.HeadingTwo:
      case CommentEditorBlockFormat.HeadingThree:
        return convertHeadingToText(block);
      case CommentEditorBlockFormat.Blockquote:
        return convertBlockquoteToText(block);
      case CommentEditorBlockFormat.BulletedList:
      case CommentEditorBlockFormat.NumberedList:
        return convertListToText(block);
      default:
        return '';
    }
  };

  // 主函数：将整个 schema 转换为纯文本
  export const to = (schema: CommentEditorBlock[]): string => {
    const text: string = schema
      .map(block => convertBlockToText(block))
      .join('');
    return text.trim();
  };
}
