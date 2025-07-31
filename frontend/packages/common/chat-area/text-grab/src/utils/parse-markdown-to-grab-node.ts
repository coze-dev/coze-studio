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

import { parseMarkdownHelper } from '@coze-common/chat-area-utils';
import { parseMarkdown } from '@coze-arch/bot-md-box-adapter/lazy';

import { GrabElementType, type GrabNode } from '../types/node';

const { isImage, isLink, isParent, isText } = parseMarkdownHelper;

/**
 * Get a GrabNode node
 * @param markdown string
 * @returns GrabNode[]
 */
export const parseMarkdownToGrabNode = (markdown: string) => {
  const ast = parseMarkdown(markdown);

  return getGrabNodeFromAst(ast);
};

/**
 * Parsing from Markdown's AST to a GrabNode node
 * @param ast markdown ast by parseMarkdown (md-box)
 * @returns GrabNode[]
 */
export const getGrabNodeFromAst = (ast: unknown): GrabNode[] => {
  const normalizedNodeList: GrabNode[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- as expected
  const traverseAst = (_ast: any) => {
    if (isText(_ast)) {
      normalizedNodeList.push({
        text: _ast.value,
      });
    } else if (isLink(_ast)) {
      const children = _ast.children.map(getGrabNodeFromAst).flat(1);
      normalizedNodeList.push({
        type: GrabElementType.LINK,
        url: _ast.url,
        children,
      });
    } else if (isImage(_ast)) {
      normalizedNodeList.push({
        type: GrabElementType.IMAGE,
        src: _ast.url,
        children: [
          {
            text: _ast.alt ?? '',
          },
        ],
      });
    } else if (isParent(_ast)) {
      _ast.children.forEach(traverseAst);
    }
  };

  traverseAst(ast);

  return normalizedNodeList;
};
