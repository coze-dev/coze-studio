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

import type { TreeNodeCustomData } from '../../../type';
import { traverse, type TraverseContext } from './traverse';

/** 计算路径 */
const getTreePath = (context: TraverseContext): string => {
  const parents = context
    .getParents()
    .filter(
      node =>
        typeof node.value === 'object' &&
        typeof node.value.name !== 'undefined' &&
        typeof node.value.type !== 'undefined',
    );
  return parents.map(node => node.value.name).join('/');
};

/** 新旧数据保留 key 防止变量系统引用失效 */
export const mergeData = (params: {
  newData: TreeNodeCustomData;
  oldData: TreeNodeCustomData;
}): TreeNodeCustomData => {
  const { newData, oldData } = params;

  // 计算旧数据中路径与key的映射
  const treeDataPathKeyMap = new Map<
    string,
    {
      key: string;
    }
  >();
  traverse(oldData, context => {
    if (
      typeof context.node.value !== 'object' ||
      typeof context.node.value.key === 'undefined' ||
      typeof context.node.value.type === 'undefined'
    ) {
      return;
    }
    const stringifyPath = getTreePath(context);
    treeDataPathKeyMap.set(stringifyPath, {
      key: context.node.value.key,
    });
  });

  // 新数据复用旧数据的key，失败则重新生成
  const newDataWithKey = traverse(newData, context => {
    if (
      typeof context.node.value !== 'object' ||
      typeof context.node.value.type === 'undefined'
    ) {
      return;
    }
    const stringifyPath = getTreePath(context);
    const { key } = treeDataPathKeyMap.get(stringifyPath) || {
      key: nanoid(),
    };
    context.node.value.key = key;
  });

  return newDataWithKey;
};
