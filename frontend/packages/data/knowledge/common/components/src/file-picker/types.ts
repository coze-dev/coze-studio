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
 * file selection tree node
 */
export interface FileNode extends TreeNodeData {
  /** Unique key identifier, can be used, file id */
  key: string;
  value?: string;
  label?: React.ReactNode;
  type?: TreeNodeType;
  // URL of the icon
  icon?: string;
  children?: FileNode[];
  /** Required when identifying whether the current node is a leaf node loadData */
  isLeaf?: boolean;
  /** Can the node be selected? */
  selectable?: boolean;
  /** The loading status of the node, after opening, the loading default replaces the icon, and displays the loadingInfo.
   *  Note that this is different from the loading of the semi itself. The loading of the semi refers to the unfolded loading state. */
  isLoading?: boolean;
  /** Node loading prompt, the default is "getting" */
  loadingInfo?: string;
  /** Specific document types, such as doc docx txt, etc */
  file_type?: string;
  /** Three-way document link  */
  file_url?: string;
  /** [Feishu scene] wiki space id,*/
  space_id?: string;
  /** [Feishu scene] wiki leaf id,*/
  obj_token?: string;
  /** Custom Rendering Items */
  render?: () => ReactNode;
  /** Read-only, not interactive */
  readonly?: boolean;
  /** Whether the node is not selectable, the default is false */
  unCheckable?: boolean;
}

export type FileId = string;

/**
 * File selection tree, node selection status
 */
export interface FileSelectCheckStatus {
  checked: boolean;
  halfChecked: boolean;
}

// Three parts, currently selected, newly selected, unselected from last time, unchanged from last time
export type TransSelectedFilesMiddleware = (
  fileNodes: FileNode[],
) => FileNode[];

export type CalcCurrentSelectFilesMiddleware = (
  fileNodes: FileNode[],
  addNodes?: FileNode[],
  removeNodes?: FileNode[],
  retainNodes?: FileNode[],
) => FileNode[];

/** Type assertion, node is not fileNode */
export function isFileNode(fileNode: unknown): fileNode is FileNode {
  return !!fileNode && isObject(fileNode) && !!(fileNode as FileNode).key;
}

/** Type assertion, array is not a fileNode array */
export function isFileNodeArray(fileNodes: unknown[]): fileNodes is FileNode[] {
  return fileNodes.every(fileNode => isFileNode(fileNode));
}
