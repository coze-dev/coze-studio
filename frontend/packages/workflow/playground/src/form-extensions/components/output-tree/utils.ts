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

import { nanoid } from 'nanoid';

import { type TreeNodeCustomData } from './components/custom-tree-node/type';
import { ObjectLikeTypes } from './components/custom-tree-node/constants';

interface RootFindResult {
  isRoot: true;
  data: TreeNodeCustomData;
  parentData: null;
}
interface ChildrenFindResult {
  isRoot: false;
  parentData: TreeNodeCustomData;
  data: TreeNodeCustomData;
}

export type FindDataResult = RootFindResult | ChildrenFindResult | null;
/**
 * According to the target array, find the value and position of the key in the item, mainly to obtain the position, which is convenient for operating the children of the parent.
 */
export function findCustomTreeNodeDataResult(
  target: Array<TreeNodeCustomData>,
  findField: string,
): FindDataResult {
  const dataInRoot = target.find(item => item.field === findField);
  if (dataInRoot) {
    // If it is the root node
    return {
      isRoot: true,
      parentData: null,
      data: dataInRoot,
    };
  }
  function findDataInChildrenLoop(
    customChildren: Array<TreeNodeCustomData>,
    parentData?: TreeNodeCustomData,
  ): FindDataResult {
    function findDataLoop(
      customData: TreeNodeCustomData,
      _parentData: TreeNodeCustomData,
    ): FindDataResult {
      if (customData.field === findField) {
        return {
          isRoot: false,
          parentData: _parentData,
          data: customData,
        };
      }
      if (customData.children && customData.children.length > 0) {
        return findDataInChildrenLoop(
          customData.children as Array<TreeNodeCustomData>,
          customData,
        );
      }
      return null;
    }
    for (const child of customChildren) {
      const childResult = findDataLoop(child, parentData || child);
      if (childResult) {
        return childResult;
      }
    }
    return null;
  }
  return findDataInChildrenLoop(target);
}

const MAX_LINE_LEVEL = 2;
export function formatTreeData(
  data: Array<TreeNodeCustomData>,
  startField: string,
) {
  let hasObjectLike = false;
  const itemKeysWithChildren: string[] = [];
  function resolveActionParamList(
    list: Array<TreeNodeCustomData>,
    field: string,
    // It is mainly used to assist the judgment of the display line.
    {
      parentData,
      level,
    }: {
      parentData?: TreeNodeCustomData;
      level: number;
    },
  ) {
    (list || []).forEach((item, index) => {
      const keyField = `${field}[${index}]`;
      hasObjectLike = hasObjectLike || ObjectLikeTypes.includes(item.type);
      // Assignment children
      item.key = item.key ?? item.fieldRandomKey ?? nanoid();
      item.field = keyField;
      item.isFirst = index === 0;
      item.isLast = index === list.length - 1;
      item.isSingle = item.isFirst && item.isLast;
      item.level = level;
      // The first level does not show the auxiliary line, you need to judge the level
      // That is, the second level (level = 1) only needs its own level line
      // After the third level (level = 2), the guide line is required to show the guide line of the previous level
      item.helpLineShow =
        parentData && level >= MAX_LINE_LEVEL
          ? (parentData.helpLineShow || []).concat(!parentData.isLast)
          : [];
      if (item.children && item.children.length > 0) {
        itemKeysWithChildren.push(item.key);
        resolveActionParamList(
          item.children as Array<TreeNodeCustomData>,
          `${keyField}.children`,
          {
            parentData: item,
            level: level + 1,
          },
        );
      }
    });
  }

  resolveActionParamList(data || [], startField, { level: 0 });

  return {
    data,
    hasObjectLike,
    itemKeysWithChildren,
  };
}

/** Calculate Sidebar Width */
export const calcIDESideSheetWidth = (nodeWidth?: number) => {
  const minWorkflowWidth = 1000;
  const sideSheetReduceScale = 0.66;
  const sideSheetMinWidth = 850;
  const windowWidth = window.innerWidth;
  const computedSideSheetWidth = windowWidth * sideSheetReduceScale;
  const computedCanvasWidth = windowWidth - computedSideSheetWidth;

  if (windowWidth < minWorkflowWidth) {
    return computedSideSheetWidth;
  }

  if (nodeWidth && computedCanvasWidth < nodeWidth) {
    return windowWidth - nodeWidth;
  }

  if (computedSideSheetWidth < sideSheetMinWidth) {
    return sideSheetMinWidth;
  } else {
    return computedSideSheetWidth;
  }
};

interface TreeNode<T> {
  children?: T[];
  [key: string]: unknown;
}

export function traverse<T extends TreeNode<T>>(
  nodeOrNodes: T | T[],
  action: (node: T) => void,
) {
  const nodes = Array.isArray(nodeOrNodes) ? nodeOrNodes : [nodeOrNodes];

  nodes.forEach(node => {
    action(node);

    if (node.children && node.children.length > 0) {
      traverse(node.children, action);
    }
  });
}
