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

import { type TreeNodeCustomData } from '../components/custom-tree-node/type';
import { ObjectLikeTypes } from '../components/custom-tree-node/constants';

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
 * 根据target数组，找到key在该项的值和位置，主要是获取位置，方便操作parent的children
 */
export function findCustomTreeNodeDataResult(
  target: Array<TreeNodeCustomData>,
  findField: string,
): FindDataResult {
  const dataInRoot = target.find(item => item.field === findField);
  if (dataInRoot) {
    // 如果是根节点
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
export function formatTreeData(data: Array<TreeNodeCustomData>) {
  let hasObjectLike = false;
  function resolveActionParamList(
    list: Array<TreeNodeCustomData>,
    field: string,
    // 主要是用来辅助展示线的判断的
    {
      parentData,
      level,
    }: {
      parentData?: TreeNodeCustomData;
      level: number;
    },
  ) {
    list?.forEach((item, index) => {
      const keyField = field ? `${field}.${index}` : `${index}`;
      hasObjectLike = hasObjectLike || ObjectLikeTypes.includes(item.type);
      // 赋值children
      item.key = item.key ?? item.fieldRandomKey ?? nanoid();
      item.field = keyField;
      item.isFirst = index === 0;
      item.isLast = index === list.length - 1;
      item.isSingle = item.isFirst && item.isLast;
      item.level = level;
      // 第一级不展示辅助线，需要判断level
      // 也就是第二级（level = 1）只需要自身的层级线
      // 在第三级（level = 2）之后需要辅助线展示上一级的辅助线
      item.helpLineShow =
        parentData && level >= MAX_LINE_LEVEL
          ? (parentData.helpLineShow || []).concat(!parentData.isLast)
          : [];
      if (item.children) {
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

  resolveActionParamList(data as TreeNodeCustomData[], '', { level: 0 });

  return { data, hasObjectLike };
}

export enum LineShowResult {
  HalfTopRoot,
  HalfTopRootWithChildren,
  HalfBottomRoot,
  HalfBottomRootWithChildren,
  FullRoot,
  FullRootWithChildren,
  HalfTopChild,
  HalfTopChildWithChildren,
  FullChild,
  FullChildWithChildren,
  EmptyBlock,
  HelpLineBlock,
}

// eslint-disable-next-line complexity
export function getLineShowResult({
  level,
  data,
}: {
  level: number;
  data: TreeNodeCustomData;
}): Array<LineShowResult> {
  const isRootWithChildren = level === 0 && (data.children || []).length > 0;
  const isRootWithoutChildren =
    level === 0 && (data.children || []).length === 0;
  const isChildWithChildren = level > 0 && (data.children || []).length > 0;
  const isChildWithoutChildren =
    level > 0 && (data.children || []).length === 0;
  const res: Array<LineShowResult> =
    data.helpLineShow?.map(item =>
      item ? LineShowResult.HelpLineBlock : LineShowResult.EmptyBlock,
    ) || [];
  const isRoot = isRootWithoutChildren || isRootWithChildren;
  // 根节点不需要展示线，只有非根节点才需要辅助线
  if (!isRoot) {
    if (isChildWithChildren) {
      if (data.isLast) {
        res.push(LineShowResult.HalfTopChildWithChildren);
      } else if (data.isFirst) {
        res.push(LineShowResult.FullChildWithChildren);
      } else {
        res.push(LineShowResult.FullChildWithChildren);
      }
    } else if (isChildWithoutChildren) {
      if (data.isLast) {
        res.push(LineShowResult.HalfTopChild);
      } else if (data.isFirst) {
        res.push(LineShowResult.FullChild);
      } else {
        res.push(LineShowResult.FullChild);
      }
    }
  }
  return res;
}
