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

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { describe, it, beforeEach, expect } from 'vitest';

import type {
  ExpressionEditorTreeNode,
  ExpressionEditorSegment,
  Variable,
} from '../type';
import { ExpressionEditorSegmentType } from '../constant';
import { ExpressionEditorTreeHelper } from '.';
import { ViewVariableType } from '../../variable-types';

describe('ExpressionEditorTreeHelper pruning', () => {
  let defaultTree: ExpressionEditorTreeNode[];
  let defaultSegments: ExpressionEditorSegment[];
  beforeEach(() => {
    defaultTree = [
      {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {
          type: ViewVariableType.ArrayObject,
        } as Variable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.Object,
            } as Variable,
            children: [
              {
                label: 'baz',
                value: 'baz',
                key: 'baz',
                variable: {
                  type: ViewVariableType.String,
                } as Variable,
              },
            ],
          },
        ],
      },
    ];
    defaultSegments = [
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: 'foo',
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 1,
        objectKey: 'bar',
      },
      { type: ExpressionEditorSegmentType.EndEmpty, index: 2 },
    ];
  });

  it('should pruning', () => {
    const result = ExpressionEditorTreeHelper.pruning({
      tree: defaultTree,
      segments: defaultSegments,
    });
    expect(result).toEqual([
      {
        label: 'baz',
        value: 'baz',
        key: 'baz',
        variable: {
          type: ViewVariableType.String,
        } as Variable,
      },
    ]);
  });

  it('should not pruning', () => {
    const result = ExpressionEditorTreeHelper.pruning({
      tree: defaultTree,
      segments: [],
    });
    expect(result).toEqual(defaultTree);
  });

  it('should be empty', () => {
    const result = ExpressionEditorTreeHelper.pruning({
      tree: defaultTree,
      segments: [
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 0,
          objectKey: 'trs',
        },
      ],
    });
    expect(result).toEqual(defaultTree);
  });

  it('should pruning and ignore array index segments', () => {
    const result = ExpressionEditorTreeHelper.pruning({
      tree: defaultTree,
      segments: [
        {
          type: ExpressionEditorSegmentType.ObjectKey,
          index: 0,
          objectKey: 'foo',
        },
        {
          type: ExpressionEditorSegmentType.ArrayIndex,
          index: 1,
          arrayIndex: 10,
        },
      ],
    });
    expect(result).toEqual(defaultTree);
  });
});

describe('ExpressionEditorTreeHelper fullPath without segments', () => {
  it('return node full path', () => {
    const node = {
      label: 'bar',
      value: 'bar',
      key: 'bar',
      variable: {} as Variable,
      parent: {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {} as Variable,
      },
    };
    const fullString = ExpressionEditorTreeHelper.concatFullPath({
      node,
      segments: [],
    });
    expect(fullString).toEqual('foo.bar');
  });
});

describe('ExpressionEditorTreeHelper fullPath with segments', () => {
  it('return node full path', () => {
    const node = {
      label: 'bar',
      value: 'bar',
      key: 'bar',
      variable: {} as Variable,
      parent: {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {
          type: ViewVariableType.ArrayObject,
        } as Variable,
      },
    };
    const segments: ExpressionEditorSegment[] = [
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: 'foo',
      },
      {
        type: ExpressionEditorSegmentType.ArrayIndex,
        index: 1,
        arrayIndex: 10,
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 2,
        objectKey: 'bar',
      },
      { type: ExpressionEditorSegmentType.EndEmpty, index: 3 },
    ];
    const fullString = ExpressionEditorTreeHelper.concatFullPath({
      node,
      segments,
    });
    expect(fullString).toEqual('foo[10].bar');
  });
});

describe('ExpressionEditorTreeHelper matchBranch', () => {
  it('match tree branch', () => {
    const tree: ExpressionEditorTreeNode[] = [
      {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {} as Variable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.ArrayObject,
            } as Variable,
            children: [
              {
                label: 'baz',
                value: 'baz',
                key: 'baz',
                variable: {} as Variable,
              },
            ],
          },
        ],
      },
    ];
    const segments: ExpressionEditorSegment[] = [
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: 'foo',
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 1,
        objectKey: 'bar',
      },
      {
        type: ExpressionEditorSegmentType.ArrayIndex,
        index: 2,
        arrayIndex: 10,
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 1,
        objectKey: 'baz',
      },
      { type: ExpressionEditorSegmentType.EndEmpty, index: 3 },
    ];
    const treeBranch = ExpressionEditorTreeHelper.matchTreeBranch({
      tree,
      segments,
    });
    expect(treeBranch).not.toBeUndefined();
  });

  it('match tree branch failed with incorrect array index', () => {
    const tree: ExpressionEditorTreeNode[] = [
      {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {
          type: ViewVariableType.String,
        } as Variable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.String,
            } as Variable,
          },
        ],
      },
    ];
    const segments: ExpressionEditorSegment[] = [
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: 'foo',
      },
      {
        type: ExpressionEditorSegmentType.ArrayIndex,
        index: 1,
        arrayIndex: 10,
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 2,
        objectKey: 'bar',
      },
      { type: ExpressionEditorSegmentType.EndEmpty, index: 3 },
    ];
    const treeBranch = ExpressionEditorTreeHelper.matchTreeBranch({
      tree,
      segments,
    });
    expect(treeBranch).toBeUndefined();
  });

  it('match tree branch failed, array object without index before sub item', () => {
    const tree: ExpressionEditorTreeNode[] = [
      {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {
          type: ViewVariableType.ArrayObject,
        } as Variable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.String,
            } as Variable,
          },
        ],
      },
    ];
    const segments: ExpressionEditorSegment[] = [
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: 'foo',
      },
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 2,
        objectKey: 'bar',
      },
      { type: ExpressionEditorSegmentType.EndEmpty, index: 3 },
    ];
    const treeBranch = ExpressionEditorTreeHelper.matchTreeBranch({
      tree,
      segments,
    });
    expect(treeBranch).toBeUndefined();
  });

  it('match tree branch failed with constant follow array index', () => {
    const tree: ExpressionEditorTreeNode[] = [
      {
        label: 'foo',
        value: 'foo',
        key: 'foo',
      },
    ];
    const segments: ExpressionEditorSegment[] = [
      {
        type: ExpressionEditorSegmentType.ObjectKey,
        index: 0,
        objectKey: 'foo',
      },
      {
        type: ExpressionEditorSegmentType.ArrayIndex,
        index: 1,
        arrayIndex: 10,
      },
    ];
    const treeBranch = ExpressionEditorTreeHelper.matchTreeBranch({
      tree,
      segments,
    });
    expect(treeBranch).toBeUndefined();
  });
});
