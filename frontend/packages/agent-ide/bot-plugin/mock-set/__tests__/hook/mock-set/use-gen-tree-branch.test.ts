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

import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';

import { MockDataStatus, MockDataValueType } from '../../../src/util/typings';
import {
  BranchType,
  useGenTreeBranch,
} from '../../../src/hook/use-gen-tree-branch';

describe('useGenTreeBranch', () => {
  it('should return an empty object when no mockData is provided', () => {
    const { result } = renderHook(() => useGenTreeBranch());

    expect(result.current.branchInfo).toEqual({});
    expect(result.current.prunedData).toBeUndefined();
  });

  it('should prune the tree correctly and generate branchInfo', () => {
    const mockData = {
      label: 'label',
      type: MockDataValueType.OBJECT,
      status: MockDataStatus.DEFAULT,
      key: 'root',
      isRequired: false,
      children: [
        {
          label: 'label',
          isRequired: false,
          type: MockDataValueType.ARRAY,
          status: MockDataStatus.ADDED,
          key: 'array1',
          children: [
            {
              label: 'label',
              isRequired: false,
              type: MockDataValueType.STRING,
              status: MockDataStatus.DEFAULT,
              key: 'str1',
            },
            {
              label: 'label',
              type: MockDataValueType.OBJECT,
              status: MockDataStatus.ADDED,
              isRequired: false,
              key: 'obj1',
              children: [
                {
                  label: 'label',
                  isRequired: false,
                  type: MockDataValueType.NUMBER,
                  status: MockDataStatus.DEFAULT,
                  key: 'num1',
                },
              ],
            },
          ],
        },
        {
          label: 'label',
          isRequired: false,
          type: MockDataValueType.OBJECT,
          status: MockDataStatus.DEFAULT,
          key: 'obj2',
          children: [
            {
              label: 'label',
              isRequired: false,
              type: MockDataValueType.BOOLEAN,
              status: MockDataStatus.DEFAULT,
              key: 'bool1',
            },
          ],
        },
      ],
    };

    const { result } = renderHook(() => useGenTreeBranch(mockData));

    expect(result.current.prunedData).toEqual({
      label: 'label',
      type: 'object',
      status: 'default',
      key: 'root',
      isRequired: false,
      children: [
        {
          label: 'label',
          isRequired: false,
          type: 'array',
          status: 'added',
          key: 'array1',
          children: undefined,
        },
        {
          label: 'label',
          isRequired: false,
          type: 'object',
          status: 'default',
          key: 'obj2',
          children: [
            {
              isRequired: false,
              key: 'bool1',
              label: 'label',
              status: 'default',
              type: 'boolean',
            },
          ],
        },
      ],
    });

    expect(result.current.branchInfo).toEqual({
      array1: {
        isLast: false,
        v: [],
      },
      obj2: {
        isLast: true,
        v: [],
      },
      bool1: {
        isLast: true,
        v: [BranchType.HALF],
      },
    });
  });
});
