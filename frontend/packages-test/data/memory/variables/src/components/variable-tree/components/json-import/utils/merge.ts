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
