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

/* eslint-disable @typescript-eslint/naming-convention -- enum */

export enum CommentEditorFormField {
  Size = 'size',
  Note = 'note',
}

/** editor event */
export enum CommentEditorEvent {
  /** content change event */
  Change = 'change',
  /** multiple choice event */
  MultiSelect = 'multiSelect',
  /** radio event */
  Select = 'select',
  /** out of focus event */
  Blur = 'blur',
}

/** editor block format */
export enum CommentEditorBlockFormat {
  /** paragraph */
  Paragraph = 'paragraph',
  /** Title I */
  HeadingOne = 'heading-one',
  /** Title II */
  HeadingTwo = 'heading-two',
  /** Title III */
  HeadingThree = 'heading-three',
  /** quote */
  Blockquote = 'block-quote',
  /** unordered list */
  BulletedList = 'bulleted-list',
  /** ordered list */
  NumberedList = 'numbered-list',
  /** list item */
  ListItem = 'list-item',
}

export const CommentEditorListBlockFormat = [
  CommentEditorBlockFormat.BulletedList,
  CommentEditorBlockFormat.NumberedList,
];

export const CommentEditorLeafType = 'text';

/** Editor leaf node format */
export enum CommentEditorLeafFormat {
  /** bold */
  Bold = 'bold',
  /** Italic */
  Italic = 'italic',
  /** underline */
  Underline = 'underline',
  /** Strikethrough */
  Strikethrough = 'strikethrough',
  /** link */
  Link = 'link',
}

/** Editor default block */
export const CommentEditorDefaultBlocks = [
  {
    type: CommentEditorBlockFormat.Paragraph,
    children: [{ text: '' }],
  },
];

/** Editor Default */
export const CommentEditorDefaultValue = JSON.stringify(
  CommentEditorDefaultBlocks,
);

/** Toolbar display delay */
export const CommentToolbarDisplayDelay = 200;

/** default link */
export const CommentDefaultLink = 'about:blank';
