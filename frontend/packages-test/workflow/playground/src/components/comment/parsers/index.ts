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
