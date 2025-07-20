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
 
import { type ReactNode } from 'react';

import { isObject } from 'lodash-es';
import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';

export enum TreeNodeType {
  FILE_TEXT = 2,
  FILE_TABLE = 3,
  FOLDER = 1,
}

export interface PickerRef {
  search?: (searchText: string) => void;
}

/**
 * 文件选择树节点
 */
export interface FileNode extends TreeNodeData {
  /** 独一无二的 key 标识 可以用 文件 id */
  key: string;
  value?: string;
  label?: React.ReactNode;
  type?: TreeNodeType;
  // icon 的 URL
  icon?: string;
  children?: FileNode[];
  /** 标识当前节点是不是叶子结点 loadData 时必备 */
  isLeaf?: boolean;
  /** 该节点是否可以选中 */
  selectable?: boolean;
  /** 节点的 loading 状态，开启后 loading 默认替换 icon，展示 loadingInfo，
   *  注意这个和 semi 本身带的 loading 不一样，semi 的 loading 指的是 展开的 loading 状态 */
  isLoading?: boolean;
  /** 节点 loading 的提示，默认是 `获取中` */
  loadingInfo?: string;
  /** 具体的文档类型 比如 doc docx txt 等 */
  file_type?: string;
  /** 三方文档链接  */
  file_url?: string;
  /** 【飞书场景】wiki 空间id,*/
  space_id?: string;
  /** 【飞书场景】wiki 叶子id,*/
  obj_token?: string;
  /** 自定义渲染 Item */
  render?: () => ReactNode;
  /** 只读，不可交互 */
  readonly?: boolean;
  /** 节点是否不可选择，默认为 false */
  unCheckable?: boolean;
}

export type FileId = string;

/**
 * 文件选择树 节点选择状态
 */
export interface FileSelectCheckStatus {
  checked: boolean;
  halfChecked: boolean;
}

// 三部分 当前选中的 新增选中的 较上次不选中的 较上次不变的
export type TransSelectedFilesMiddleware = (
  fileNodes: FileNode[],
) => FileNode[];

export type CalcCurrentSelectFilesMiddleware = (
  fileNodes: FileNode[],
  addNodes?: FileNode[],
  removeNodes?: FileNode[],
  retainNodes?: FileNode[],
) => FileNode[];

/** 类型断言 节点是不是 fileNode */
export function isFileNode(fileNode: unknown): fileNode is FileNode {
  return !!fileNode && isObject(fileNode) && !!(fileNode as FileNode).key;
}

/** 类型断言 数组是不是 fileNode 数组 */
export function isFileNodeArray(fileNodes: unknown[]): fileNodes is FileNode[] {
  return fileNodes.every(fileNode => isFileNode(fileNode));
}
