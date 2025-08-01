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

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type CSSProperties } from 'react';

import { type CommonFieldProps } from '@coze-arch/coze-design';

export interface Delta {
  insert: string;
}
export interface Editor {
  setHTML: (htmlContent: string) => void;
  setContent: (content: { deltas: Delta[] }) => void;
  getContent: () => {
    deltas: Delta[];
  };
  setText: (text: string) => void;
  getText: () => string;
  getRootContainer: () => HTMLDivElement | null;
  getContentState: () => any;
  selection: any;
  registerCommand: (command: string, callback: () => void) => void;
  scrollModule: {
    scrollTo: (props: any) => void;
  };
  on: (event: string, callback: (...args: any[]) => void) => void;
}
export interface EditorHandle {
  setDeltaContent: (delta?: any) => void;
  getMarkdown: () => string;
  getEditor: () => Editor;
}
export interface EditorInputProps extends CommonFieldProps {
  value?: string;
  className?: string;
  style?: CSSProperties;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  validateStatus?: 'error' | 'default';
  /**
   * Register custom plugins
   * @param plugins
   */
  registerPlugins?: any;
  /**
   * Custom toolbar
   */
  registerToolItem?: any;
  /** Custom schema */
  schema?: any;
  businessKey?: string; // To register the toolbar
  getMentionData?: (query?: string) => Promise<any[]>;
  maxCount?: number; // Number of characters displayed, default to -1 (unlimited)
  disabled?: boolean; // disable
  noToolbar?: boolean; // Hide Toolbar
  noExpand?: boolean; // Expand icon in lower right corner
  onExpand?: () => void; // Click expand icon
  /**
   * When plainText mode is enabled, the input content will not be different from the native textarea, markdown support will be removed, and toolbar will be hidden (the noToolbar property will be overridden).
   * @default false
   */
  plainText?: boolean;
  withInputTitle?: {
    placeholder: string;
    maxCount?: number;
    onChange: (value: string) => void;
  }; // With title editor (similar to Feishu, title and body together)

  getUploadToken?: () => Promise<any>; // Customize to get the token of the uploaded image.

  getImgURL?: (req?: any) => Promise<any>; // Customize to get the picture url according to the picture uri.
  getEditor?: (editor: Editor) => void;
}

export interface IRenderContext {
  insert: string;
  domAttributes: {
    [key: string]: any;
  };
  key: string;
  children: JSX.Element;
  style: React.CSSProperties;
  index: number;
  zoneId: string;
}

export interface IApplyMetadata {
  id: string;
  type: string;
  options: any;
}

export enum displayType {
  inline = 'inline',
  block = 'block',
}

export enum ToolbarItemEnum {
  Bold = 'Bold',
  Italic = 'Italic',
  Underline = 'Underline',
  Undo = 'Undo',
  Redo = 'Redo',
  Strikethrough = 'Strikethrough',
  Blockquote = 'Blockquote',
  UnorderedList = 'UnorderedList',
  OrderedList = 'OrderedList',
  Checkbox = 'Checkbox',
  Indent = 'Indent',
  H1 = 'H1',
  H2 = 'H2',
  H3 = 'H3',
  AlignCenter = 'AlignCenter',
  AlignLeft = 'AlignLeft',
  AlignRight = 'AlignRight',
  HorizontalLine = 'HorizontalLine',
  Hyperlink = 'Hyperlink',
  Image = 'Image',
  Table = 'Table',
  CodeBlock = 'CodeBlock',
  Video = 'Video',
  DIVIDER = 'DIVIDER',
  ColorPicker = 'ColorPicker',
  FontSizeDropdown = 'FontSizeDropdown',
  AlignDropdown = 'AlignDropdown',
  HeadingDropdown = 'HeadingDropdown',
  FontFamilyDropdown = 'FontFamilyDropdown',
}

export const DEFAULT_ZONE = '0';

export const ZoneDelta: any = {};

export interface MentionType {
  avatar_url: string;
  cn_name: string;
  en_name: string;
  type: string;
  id: string;
}

export interface Delta2mdResult {
  markdown: string;
  images?: string[];
  links?: string[];
  mentions?: MentionType[];
  codeblocks: string[];
}

export class DeltaSet {
  constructor(public deltas: Delta[]) {
    this.deltas = deltas;
  }
}

export type DeltaSetOptions =
  | Delta[]
  | {
      [zoneId: string]: {
        zoneId: string;
        ops: any;
        zoneType: any;
      };
    };
export enum EditorEventType {
  DID_PASTE = 'didPaste',
  RESIZE = 'resize',
  RECT_CHANGE = 'rectchange',
  SELECTION_CHANGE = 'selectionchange',
  SELECTION_CHANGE_AND_DOM_UPDATE = 'editorUpdateDomSelection',
  CONTENT_WILL_CHANGE = 'contentWillChange',
  CONTENT_CHANGE = 'contentchange',
  EDITABLE_CHANGE = 'editablechange',
  PAINT = 'paint',
  COPY = 'copy',
  CUT = 'cut',
  PASTE = 'paste',
  WILL_DELETE_FROM_CUT = 'willDeleteFromCut',
  INPUT = 'input',
  BEFORE_INPUT = 'beforeinput',
  KEYDOWN = 'keydown',
  KEYPRESS = 'keypress',
  KEYUP = 'keyup',
  EXEC_COMMAND = 'execCommand',
  ERROR = 'error',
  DELETE_KEY = 'keyDelete',
  FOCUS = 'focus',
  BLUR = 'blur',
  SCROLL_END = 'scrollend',
  SCROLL = 'scroll',
  KEYBAORDCHANGE = 'keyboardchange',
  COMPOSITION_END = 'compositionend',
  COMPOSITION_START = 'compositionstart',
  COMPOSITION_UPDATE = 'compositionupdate',
  REACT_CONTEXT_UPDATE = 'reactContextUpdate',
  BEFORE_DOM_RENDERER_RECONCILE = 'beforeDomRendererReconcile',
  AFTER_DOM_RENDERER_RECONCILE = 'afterDomRendererReconcile',
  UNDO_DID_INIT = 'undoDidInit',
}
