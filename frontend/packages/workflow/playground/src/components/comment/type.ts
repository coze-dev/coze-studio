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

import type { KeyboardEventHandler } from 'react';

import type { Node as SlateNode, Element as SlateElement } from 'slate';

import type { CommentEditorModel } from './model';
import type {
  CommentEditorEvent,
  CommentEditorBlockFormat,
  CommentEditorLeafFormat,
  CommentEditorLeafType,
} from './constant';

export type CommentEditorFormat =
  | CommentEditorLeafFormat
  | CommentEditorBlockFormat;

export type CommentEditorEventParams<T extends CommentEditorEvent> = {
  [CommentEditorEvent.Change]: {
    blocks: CommentEditorBlock[];
    value: string;
  };
  [CommentEditorEvent.MultiSelect]: {};
  [CommentEditorEvent.Select]: {};
  [CommentEditorEvent.Blur]: {};
}[T];

export type CommentEditorEventDisposer = () => void;

export interface CommentEditorLeaf {
  type: typeof CommentEditorLeafType;
  text: string;
  [CommentEditorLeafFormat.Bold]?: boolean;
  [CommentEditorLeafFormat.Italic]?: boolean;
  [CommentEditorLeafFormat.Underline]?: boolean;
  [CommentEditorLeafFormat.Strikethrough]?: boolean;
  [CommentEditorLeafFormat.Link]?: string;
}

export interface CommentEditorBlock {
  type: CommentEditorBlockFormat;
  children: Array<CommentEditorLeaf | CommentEditorBlock>;
}

export type CommentEditorNode = SlateNode;
export type CommentEditorElement = SlateElement;

export interface CommentEditorCommand {
  key: string;
  modifier?: boolean;
  shift?: boolean;
  exec: (params: {
    model: CommentEditorModel;
    event: Parameters<KeyboardEventHandler<HTMLDivElement>>[0];
  }) => void;
}
