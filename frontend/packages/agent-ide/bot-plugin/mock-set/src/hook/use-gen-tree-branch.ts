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
      // Longitudinal cable
      v: BranchType[];
      isLast: boolean;
    }
  | undefined
>;

export function useGenTreeBranch(mockData?: MockDataWithStatus) {
  const [branchInfo, setBranchInfo] = useState<BranchInfo>({});
  const [pruned, setPruned] = useState<MockDataWithStatus>();

  // Cut branches
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
