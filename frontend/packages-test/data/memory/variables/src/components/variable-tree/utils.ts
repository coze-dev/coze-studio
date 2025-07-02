import { traverse } from '@/utils/traverse';
import { type Variable, type VariableGroup } from '@/store';

import { type TreeNodeCustomData } from './type';

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
  variableId: string,
): FindDataResult {
  const dataInRoot = target.find(item => item.variableId === variableId);
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
      if (customData.variableId === variableId) {
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

// 将groupVariableMeta打平为viewVariableTreeNode[]
export function flatGroupVariableMeta(
  groupVariableMeta: VariableGroup[],
  maxDepth = Infinity,
) {
  const res: Variable[] = [];
  traverse(
    groupVariableMeta,
    item => {
      res.push(...item.varInfoList);
    },
    'subGroupList',
    maxDepth,
  );
  return res;
}
export const flatVariableTreeData = (treeData: Variable[]) => {
  const res: Variable[] = [];
  traverse(
    treeData,
    item => {
      res.push(item);
    },
    'children',
  );
  return res;
};
