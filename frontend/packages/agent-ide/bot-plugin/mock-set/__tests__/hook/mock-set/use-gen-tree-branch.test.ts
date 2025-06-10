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
