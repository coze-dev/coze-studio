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
   * 注册自定义插件
   * @param plugins
   */
  registerPlugins?: any;
  /**
   * 自定义toolbar
   */
  registerToolItem?: any;
  /** 自定义schema */
  schema?: any;
  businessKey?: string; // 用于注册toolbar
  getMentionData?: (query?: string) => Promise<any[]>;
  maxCount?: number; // 字符数显示，默认为-1（不限制）
  disabled?: boolean; // 禁用
  noToolbar?: boolean; // 隐藏工具栏
  noExpand?: boolean; // 右下角展开icon
  onExpand?: () => void; // 点击展开icon
  /**
   * 开启 plainText 模式后，输入内容与原生 textarea 不会有区别，会取消 markdown 支持，并隐藏 toolbar（会覆盖 noToolbar 属性）
   * @default false
   */
  plainText?: boolean;
  withInputTitle?: {
    placeholder: string;
    maxCount?: number;
    onChange: (value: string) => void;
  }; // 带标题编辑器（类似飞书，标题和正文在一起）

  getUploadToken?: () => Promise<any>; // 自定义获取上传图片的token

  getImgURL?: (req?: any) => Promise<any>; // 自定义根据图片uri获取图片url
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
