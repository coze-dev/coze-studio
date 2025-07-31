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

import type { FileNode, TransSelectedFilesMiddleware } from './types';

export const getLeafFiles: TransSelectedFilesMiddleware = (
  files?: FileNode[],
) => {
  if (!files || files.length === 0) {
    return [];
  }
  const leafFiles: FileNode[] = [];
  const helpQueue = Array.from(files);
  while (helpQueue.length > 0) {
    const curFile = helpQueue.shift();
    if (
      curFile?.isLeaf ||
      !curFile?.children ||
      curFile.children.length === 0
    ) {
      curFile && leafFiles.push(curFile);
    } else {
      helpQueue.push(...curFile.children);
    }
  }
  return leafFiles;
};

function levelMapTreeNodes<
  T extends {
    children?: T[];
    isLeaf?: boolean;
  },
>(treeNodes: T[]): T[] {
  const allNode: T[] = [];
  const helpRemoveQueue = Array.from(treeNodes);
  while (helpRemoveQueue.length > 0) {
    const curFile = helpRemoveQueue.shift();
    curFile && allNode.push(curFile);
    if (!curFile?.isLeaf && curFile?.children && curFile.children.length > 0) {
      helpRemoveQueue.push(...curFile.children);
    }
  }
  return allNode;
}

export function levelMapTreeNodesToMap<
  T extends {
    key: string;
    children?: T[];
    isLeaf?: boolean;
  },
>(treeNodes: T[]): Map<string, T> {
  const allNodeMap: Map<string, T> = new Map();
  const helpRemoveQueue = Array.from(treeNodes);
  while (helpRemoveQueue.length > 0) {
    const curFile = helpRemoveQueue.shift();
    curFile && allNodeMap.set(curFile.key, curFile);
    if (!curFile?.isLeaf && curFile?.children && curFile.children.length > 0) {
      helpRemoveQueue.push(...curFile.children);
    }
  }
  return allNodeMap;
}

export const appendAllAddFiles: TransSelectedFilesMiddleware = (
  files?: FileNode[],
  addNodes?: FileNode[],
  removeNodes?: FileNode[],
  retainNodes: FileNode[] = [],
  // eslint-disable-next-line max-params
) => {
  if (!files || files.length === 0) {
    return [];
  }
  if (!addNodes) {
    return files;
  }

  const allRemoveFiles: FileNode[] = levelMapTreeNodes<FileNode>(
    removeNodes ?? [],
  );
  const removeKeys = new Set(allRemoveFiles.map(file => file.key));
  const allAddFiles: FileNode[] = levelMapTreeNodes<FileNode>(addNodes ?? []);

  return [...allAddFiles, ...retainNodes].filter(
    file => !removeKeys.has(file.key),
  );
};

export const distinctFileNodes: TransSelectedFilesMiddleware = (
  files?: FileNode[],
) => {
  if (!files) {
    return [];
  }
  const distinctFiles: FileNode[] = [];
  const distinctFileKey: Set<string> = new Set();
  for (const file of files) {
    if (distinctFileKey.has(file.key)) {
      continue;
    }
    distinctFileKey.add(file.key);
    distinctFiles.push(file);
  }
  return distinctFiles;
};
