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

import { CommentEditorTextParser } from './text';
import { CommentEditorMarkdownParser } from './markdown';
import { CommentEditorJSONParser } from './json';
import { CommentEditorHTMLParser } from './html';

export namespace CommentEditorParser {
  export const fromJSON = CommentEditorJSONParser.from;
  export const toJSON = CommentEditorJSONParser.to;
  export const toText = CommentEditorTextParser.to;
  export const toMarkdown = CommentEditorMarkdownParser.to;
  export const toHTML = CommentEditorHTMLParser.to;
}
