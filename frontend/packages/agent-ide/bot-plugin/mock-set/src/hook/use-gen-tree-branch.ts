import { useState, useEffect } from 'react';

import {
  MockDataStatus,
  MockDataValueType,
  type MockDataWithStatus,
} from '../util/typings';

export enum BranchType {
  NONE,
  VISIBLE,
  HALF,
}

type BranchInfo = Record<
  string,
  | {
      // 纵向连接线
      v: BranchType[];
      isLast: boolean;
    }
  | undefined
>;

export function useGenTreeBranch(mockData?: MockDataWithStatus) {
  const [branchInfo, setBranchInfo] = useState<BranchInfo>({});
  const [pruned, setPruned] = useState<MockDataWithStatus>();

  // 裁剪树枝
  // @ts-expect-error -- linter-disable-autofix
  const pruning = (data?: MockDataWithStatus) => {
    if (!data?.children) {
      return;
    }

    // @ts-expect-error -- linter-disable-autofix
    const children = data.children.map(cur => {
      if (
        cur.type === MockDataValueType.ARRAY ||
        cur.type === MockDataValueType.OBJECT
      ) {
        if (cur.isRequired === false && cur.status === MockDataStatus.ADDED) {
          return {
            ...cur,
            children: undefined,
          };
        } else {
          return pruning(cur);
        }
      } else {
        return { ...cur };
      }
    });

    return {
      ...data,
      children,
    };
  };

  const generate = (
    data?: MockDataWithStatus,
    branchPrefix: BranchType[] = [],
  ) => {
    const branch: BranchInfo = {};
    if (data?.children) {
      const { length } = data.children;
      data?.children.forEach((item, index) => {
        const isLast = index === length - 1;
        branch[item.key] = {
          isLast,
          v:
            isLast && branchPrefix.length > 0
              ? [...branchPrefix.slice(0, -1), BranchType.HALF]
              : branchPrefix,
        };
        const childBranchPrefix: BranchType[] =
          isLast && branchPrefix.length > 0
            ? [
                ...branchPrefix.slice(0, -1),
                BranchType.NONE,
                BranchType.VISIBLE,
              ]
            : [...branchPrefix, BranchType.VISIBLE];
        Object.assign(branch, generate(item, childBranchPrefix));
      });
    }
    return branch;
  };

  useEffect(() => {
    const result = pruning(mockData);
    const branch = generate(result);

    setPruned(result);
    setBranchInfo(branch);
  }, [mockData]);

  return {
    branchInfo,
    prunedData: pruned,
  };
}
