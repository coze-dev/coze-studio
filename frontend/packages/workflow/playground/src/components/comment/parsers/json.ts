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
import type { CommentEditorBlock } from '../type';
import {
  type CommentEditorBlockFormat,
  CommentEditorDefaultBlocks,
  CommentEditorLeafType,
} from '../constant';

export namespace CommentEditorJSONParser {
  // Processing a single node
  const processNode = (node: CommentEditorBlock): CommentEditorBlock => {
    if ('text' in node && !node.type) {
      return {
        ...node,
        type: CommentEditorLeafType as unknown as CommentEditorBlockFormat,
      };
    }

    if ('type' in node && 'children' in node) {
      return {
        ...node,
        children: (node.children as CommentEditorBlock[]).map(processNode),
      };
    }

    return node as CommentEditorBlock;
  };

  // Main function: handle the entire schema
  const addLeafType = (schema: CommentEditorBlock[]): CommentEditorBlock[] =>
    schema.map(processNode);

  /** Convert JSON to Schema */
  export const from = (value?: string): CommentEditorBlock[] | undefined => {
    if (!value || value === '') {
      return CommentEditorDefaultBlocks as CommentEditorBlock[];
    }
    try {
      const blocks = JSON.parse(value);
      return blocks;
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need to handle error
    } catch (error) {
      return;
    }
  };

  /** Schema to JSON */
  export const to = (schema: CommentEditorBlock[]): string | undefined => {
    try {
      const value = JSON.stringify(addLeafType(schema));
      return value;
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need to handle error
    } catch (error) {
      return;
    }
  };
}
