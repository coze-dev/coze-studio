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
