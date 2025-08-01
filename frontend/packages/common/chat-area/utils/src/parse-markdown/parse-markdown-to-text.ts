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

import { type Text, type Link, type Parent, type Image } from 'mdast';
import { isObject, isUndefined } from 'lodash-es';
/**
 * Convert markdown to plain text
 * @param markdown Markdown text
 * @Returns string plain text
 */
export const getTextFromAst = (ast: unknown): string => {
  if (isParent(ast)) {
    return `${ast.children.map(child => getTextFromAst(child)).join('')}`;
  }

  if (isText(ast)) {
    return ast.value;
  }

  if (isLink(ast)) {
    return `[${getTextFromAst(ast.children)}](${ast.url})`;
  }

  if (isImage(ast)) {
    return `![${ast.alt}](${ast.url})`;
  }

  return '';
};

const isParent = (ast: unknown): ast is Parent =>
  !!ast && isObject(ast) && 'children' in ast && !isUndefined(ast?.children);

const isLink = (ast: unknown): ast is Link =>
  isObject(ast) && 'type' in ast && !isUndefined(ast) && ast.type === 'link';

const isImage = (ast: unknown): ast is Image =>
  !isUndefined(ast) && isObject(ast) && 'type' in ast && ast.type === 'image';

const isText = (ast: unknown): ast is Text =>
  !isUndefined(ast) && isObject(ast) && 'type' in ast && ast.type === 'text';

export const parseMarkdownHelper = {
  isParent,
  isLink,
  isImage,
  isText,
};
