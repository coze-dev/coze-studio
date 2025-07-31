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

import { describe, it, expect } from 'vitest';

import { CommentEditorParser } from '../parsers';
import {
  commentEditorMockBlocks,
  commentEditorMockText,
  commentEditorMockMarkdown,
  commentEditorMockHTML,
  commentEditorMockJSON,
} from './mock';

describe('CommentEditorParser', () => {
  it('toText', () => {
    expect(CommentEditorParser.toText(commentEditorMockBlocks)).toBe(
      commentEditorMockText,
    );
  });

  it('toMarkdown', () => {
    expect(CommentEditorParser.toMarkdown(commentEditorMockBlocks)).toBe(
      commentEditorMockMarkdown,
    );
  });

  it('toHTML', () => {
    expect(CommentEditorParser.toHTML(commentEditorMockBlocks)).toBe(
      commentEditorMockHTML,
    );
  });

  it('toJSON', () => {
    expect(CommentEditorParser.toJSON(commentEditorMockBlocks)).toBe(
      commentEditorMockJSON,
    );
  });

  it('fromJSON', () => {
    expect(CommentEditorParser.fromJSON(commentEditorMockJSON)).toEqual(
      commentEditorMockBlocks,
    );
  });
});
