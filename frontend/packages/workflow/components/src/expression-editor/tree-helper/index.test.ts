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

import 'reflect-metadata';
import { ViewVariableType } from '@coze-workflow/base';

import type {
  ExpressionEditorTreeNode,
  ExpressionEditorSegment,
  ExpressionEditorVariable,
} from '../type';
import { ExpressionEditorSegmentType } from '../constant';
import { ExpressionEditorTreeHelper } from '.';

vi.mock('@coze-workflow/base', () => {
  enum VariableType {
    String = 1,
    Integer,
    Boolean,
    Number,
    Object = 6,
    ArrayString = 99,
    ArrayInteger,
    ArrayBoolean,
    ArrayNumber,
    ArrayObject,
  }

  return {
    ViewVariableType: {
      ...VariableType,
      isArrayType: (type: VariableType): boolean => {
        const arrayTypes = [
          VariableType.ArrayString,
          VariableType.ArrayInteger,
          VariableType.ArrayBoolean,
          VariableType.ArrayNumber,
          VariableType.ArrayObject,
        ];
        return arrayTypes.includes(type);
      },
    },
  };
});

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
        } as ExpressionEditorVariable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.Object,
            } as ExpressionEditorVariable,
            children: [
              {
                label: 'baz',
                value: 'baz',
                key: 'baz',
                variable: {
                  type: ViewVariableType.String,
                } as ExpressionEditorVariable,
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
        } as ExpressionEditorVariable,
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
      variable: {} as ExpressionEditorVariable,
      parent: {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {} as ExpressionEditorVariable,
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
      variable: {} as ExpressionEditorVariable,
      parent: {
        label: 'foo',
        value: 'foo',
        key: 'foo',
        variable: {
          type: ViewVariableType.ArrayObject,
        } as ExpressionEditorVariable,
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
        variable: {} as ExpressionEditorVariable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.ArrayObject,
            } as ExpressionEditorVariable,
            children: [
              {
                label: 'baz',
                value: 'baz',
                key: 'baz',
                variable: {} as ExpressionEditorVariable,
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
        } as ExpressionEditorVariable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.String,
            } as ExpressionEditorVariable,
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
        } as ExpressionEditorVariable,
        children: [
          {
            label: 'bar',
            value: 'bar',
            key: 'bar',
            variable: {
              type: ViewVariableType.String,
            } as ExpressionEditorVariable,
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

describe('ExpressionEditorTreeHelper findAvailableVariables & createVariableTree', () => {
  let variables: ExpressionEditorVariable[];
  let inputs: {
    name: string;
    keyPath?: string[];
  }[];
  let availableVariables: ExpressionEditorTreeHelper.AvailableVariable[];

  beforeEach(() => {
    variables = [
      {
        key: 'G3UiXFzKjTefY_iu8U59Z',
        type: 6,
        name: 'obj',
        children: [
          {
            key: 'klAhNVg0xasVuN-l3bZdw',
            type: 1,
            name: 'str',
          },
          {
            key: 'j8Hp-0mQhGfW618h35Pql',
            type: 4,
            name: 'num',
          },
        ],
        nodeTitle: 'Code',
        nodeId: '112561',
      },
      {
        key: 'UVxP2tcAXIe2DXIeT1C-o',
        type: 103,
        name: 'arr_obj',
        children: [
          {
            key: '7-id-zYuO7aBPiC48Jkk4',
            type: 1,
            name: 'str',
          },
          {
            key: 'QHB4k7Z3k2VyTipg8rjlL',
            type: 4,
            name: 'num',
          },
        ],
        nodeTitle: 'Code',
        nodeId: '112561',
      },
      {
        key: 'GX1IupmKt-gaMKC54d1a4',
        type: 99,
        name: 'arr_str',
        nodeTitle: 'Code',
        nodeId: '112561',
      },
    ];
    inputs = [
      {
        name: 'ref_obj',
        keyPath: ['112561', 'G3UiXFzKjTefY_iu8U59Z'],
      },
      {
        name: 'ref_arr_obj',
        keyPath: ['112561', 'UVxP2tcAXIe2DXIeT1C-o'],
      },
      {
        name: 'test_ref',
        keyPath: ['112561', 'G3UiXFzKjTefY_iu8U59Z', 'klAhNVg0xasVuN-l3bZdw'],
      },
      {
        name: 'ref_arr_str',
        keyPath: ['112561', 'GX1IupmKt-gaMKC54d1a4'],
      },
      {
        name: 'constant',
        keyPath: [],
      },
    ];
    availableVariables = [
      {
        name: 'ref_obj',
        keyPath: ['G3UiXFzKjTefY_iu8U59Z'],
        variable: {
          key: 'G3UiXFzKjTefY_iu8U59Z',
          type: 6,
          name: 'obj',
          children: [
            {
              key: 'klAhNVg0xasVuN-l3bZdw',
              type: 1,
              name: 'str',
            },
            {
              key: 'j8Hp-0mQhGfW618h35Pql',
              type: 4,
              name: 'num',
            },
          ],
          nodeTitle: 'Code',
          nodeId: '112561',
        },
      },
      {
        name: 'ref_arr_obj',
        keyPath: ['UVxP2tcAXIe2DXIeT1C-o'],
        variable: {
          key: 'UVxP2tcAXIe2DXIeT1C-o',
          type: 103,
          name: 'arr_obj',
          children: [
            {
              key: '7-id-zYuO7aBPiC48Jkk4',
              type: 1,
              name: 'str',
            },
            {
              key: 'QHB4k7Z3k2VyTipg8rjlL',
              type: 4,
              name: 'num',
            },
          ],
          nodeTitle: 'Code',
          nodeId: '112561',
        },
      },
      {
        name: 'test_ref',
        keyPath: ['G3UiXFzKjTefY_iu8U59Z', 'klAhNVg0xasVuN-l3bZdw'],
        variable: {
          key: 'klAhNVg0xasVuN-l3bZdw',
          type: 1,
          name: 'str',
        },
      },
      {
        name: 'ref_arr_str',
        keyPath: ['GX1IupmKt-gaMKC54d1a4'],
        variable: {
          key: 'GX1IupmKt-gaMKC54d1a4',
          type: 99,
          name: 'arr_str',
          nodeTitle: 'Code',
          nodeId: '112561',
        },
      },
      {
        name: 'constant',
      },
    ];
  });

  it('find available variables', () => {
    const results = ExpressionEditorTreeHelper.findAvailableVariables({
      variables,
      inputs,
    });
    expect(results).toEqual(availableVariables);
  });

  it('create variable tree', () => {
    const results =
      ExpressionEditorTreeHelper.createVariableTree(availableVariables);
    expect(results.length).toEqual(5);
  });
});
