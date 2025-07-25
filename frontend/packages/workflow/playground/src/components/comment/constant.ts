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

/** 编辑器事件 */
export enum CommentEditorEvent {
  /** 内容变更事件 */
  Change = 'change',
  /** 多选事件 */
  MultiSelect = 'multiSelect',
  /** 单选事件 */
  Select = 'select',
  /** 失焦事件 */
  Blur = 'blur',
}

/** 编辑器块格式 */
export enum CommentEditorBlockFormat {
  /** 段落 */
  Paragraph = 'paragraph',
  /** 标题一 */
  HeadingOne = 'heading-one',
  /** 标题二 */
  HeadingTwo = 'heading-two',
  /** 标题三 */
  HeadingThree = 'heading-three',
  /** 引用 */
  Blockquote = 'block-quote',
  /** 无序列表 */
  BulletedList = 'bulleted-list',
  /** 有序列表 */
  NumberedList = 'numbered-list',
  /** 列表项 */
  ListItem = 'list-item',
}

export const CommentEditorListBlockFormat = [
  CommentEditorBlockFormat.BulletedList,
  CommentEditorBlockFormat.NumberedList,
];

export const CommentEditorLeafType = 'text';

/** 编辑器叶子节点格式 */
export enum CommentEditorLeafFormat {
  /** 粗体 */
  Bold = 'bold',
  /** 斜体 */
  Italic = 'italic',
  /** 下划线 */
  Underline = 'underline',
  /** 删除线 */
  Strikethrough = 'strikethrough',
  /** 链接 */
  Link = 'link',
}

/** 编辑器默认块 */
export const CommentEditorDefaultBlocks = [
  {
    type: CommentEditorBlockFormat.Paragraph,
    children: [{ text: '' }],
  },
];

/** 编辑器默认值 */
export const CommentEditorDefaultValue = JSON.stringify(
  CommentEditorDefaultBlocks,
);

/** 工具栏显示延迟 */
export const CommentToolbarDisplayDelay = 200;

/** 默认链接 */
export const CommentDefaultLink = 'about:blank';
