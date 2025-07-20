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
 
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  addDepthAndValue,
  checkHasArray,
  checkSameName,
  cloneWithRandomKey,
  defaultNode,
  deleteAllChildNode,
  deleteNode,
  findPathById,
  findTemplateNodeByPath,
  handleDeepArr,
  isShowDelete,
  maxDeep,
  // sleep,
  transformTreeToObj,
  updateNodeById,
} from '../../src/components/plugin_modal/utils';

vi.mock('@coze-arch/i18n', () => ({
  I18n: { t: vi.fn() },
}));

vi.mock('@coze-arch/bot-api/plugin_develop', () => ({
  APIParameter: {},
  ParameterLocation: {},
  ParameterType: {
    String: 1,
    Integer: 2,
    Number: 3,
    Object: 4,
    Array: 5,
    Bool: 6,
  },
}));

describe('findPathById', () => {
  it('should traverse all nodes and call the callback function at each node', () => {
    const targetId = 2;
    const data = [
      { id: 1, name: 'Node 1', children: [{ id: 2, name: 'Node 2' }] },
      { id: 3, name: 'Node 3', children: [{ id: 4, name: 'Node 4' }] },
    ];

    const callback = (item: { id: number; name: string }, path) => {
      if (item.id === targetId) {
        expect(path).toEqual([0, 0]);
        expect(item.name).toEqual('Node 2');
      }
    };

    findPathById({
      data,
      callback,
      childrenName: 'children',
    });
  });
});

describe('addDepthAndValue', () => {
  // 测试 1：验证函数是否正常工作
  it('should add depth to each node in the tree', () => {
    const tree = [{ id: 1, sub_parameters: [{ id: 2 }, { id: 3 }] }, { id: 4 }];
    addDepthAndValue(tree);
    expect(tree[0].deep).toEqual(1);
    expect(tree[0].sub_parameters[0].deep).toEqual(2);
    expect(tree[0].sub_parameters[1].deep).toEqual(2);
    expect(tree[1].deep).toEqual(1);
  });

  // 测试 2：验证函数在空树情况下是否正常工作
  it('should not fail on empty trees', () => {
    const tree: any[] = [];
    addDepthAndValue(tree);
    expect(tree).toEqual([]);
  });

  // 测试 3：验证函数在只有一个节点的树情况下是否正常工作
  it('should handle single-node trees', () => {
    const tree = [{ id: 1 }];
    addDepthAndValue(tree);
    expect(tree[0].deep).toEqual(1);
  });
});

describe('handleDeepArr', () => {
  it('should handle deep array correctly', () => {
    const tree = [
      { deep: 1 },
      { deep: 2 },
      {
        deep: 3,
        sub_parameters: [{ deep: 4 }, { deep: 5 }],
      },
    ];

    const deepArr = [];
    handleDeepArr(tree, deepArr);

    // 断言
    expect(deepArr).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('maxDeep', () => {
  it('should return the correct max deep', () => {
    const tree1 = [
      { deep: 1 },
      { deep: 2 },
      {
        deep: 3,
        sub_parameters: [{ deep: 4 }, { deep: 5 }],
      },
    ];

    // 测试 tree1 的最大深度
    expect(maxDeep(tree1)).toEqual(5);
  });

  it('should return 0 for an empty tree or a tree with a single node', () => {
    const tree2 = [];
    const tree3 = [{ deep: 1 }];

    // 测试空树的最大深度
    expect(maxDeep(tree2)).toEqual(0);

    // 测试只有一个节点的树的最大深度
    expect(maxDeep(tree3)).toEqual(1);
  });
});

describe('defaultNode', () => {
  it('get default node', () => {
    const result = defaultNode(false, false, 1);
    expect(result).toEqual({
      id: expect.any(String),
      name: '',
      desc: '',
      type: 1,
      location: undefined,
      is_required: true,
      sub_parameters: [],
      deep: 1,
    });
  });
});

describe('deleteNode', () => {
  it('should delete the node with the target key', () => {
    const data = [
      { id: 'key1', sub_parameters: [] },
      { id: 'key2', sub_parameters: [] },
      { id: 'key3', sub_parameters: [] },
    ];

    const targetKey = 'key2';

    const result = deleteNode(data, targetKey);

    // 断言删除成功
    expect(result).toBe(true);
    // 断言目标节点已删除
    expect(data.find(node => node.id === targetKey)).toBeUndefined();
  });

  it('should return false if the target node is not found', () => {
    const data = [
      { id: 'key1', sub_parameters: [] },
      { id: 'key2', sub_parameters: [] },
      { id: 'key3', sub_parameters: [] },
    ];

    const targetKey = 'key4';

    const result = deleteNode(data, targetKey);

    // 断言删除失败
    expect(result).toBe(false);
  });

  it('should delete a node with children', () => {
    const data = [
      { id: 'key1', sub_parameters: [] },
      {
        id: 'key2',
        sub_parameters: [
          { id: 'key3', sub_parameters: [] },
          { id: 'key4', sub_parameters: [] },
        ],
      },
      { id: 'key5', sub_parameters: [] },
    ];

    const targetKey = 'key2';

    const result = deleteNode(data, targetKey);

    // 断言删除成功
    expect(result).toBe(true);
    // 断言目标节点已删除
    expect(data.find(node => node.id === targetKey)).toBeUndefined();
    // 断言子节点已删除
    expect(data[1].sub_parameters.length).toBe(0);
  });
});

describe('deleteAllChildNode', () => {
  const mockData = [
    {
      id: 'key1',
      sub_parameters: [
        {
          id: 'key2',
          sub_parameters: [],
        },
      ],
    },
    {
      id: 'key3',
      sub_parameters: [
        {
          id: 'key4',
          sub_parameters: [
            {
              id: 'key5',
              sub_parameters: [],
            },
          ],
        },
      ],
    },
    {
      id: 'key6',
      sub_parameters: [],
    },
  ];
  it('should delete all child nodes of the target key', () => {
    const targetKey = 'key1';
    const result = deleteAllChildNode(mockData, targetKey);
    expect(result).toBe(true);
    expect(mockData[0].sub_parameters).toEqual([]);
  });

  it('should not delete any child nodes if target key is not found', () => {
    const targetKey = 'key7';
    const result = deleteAllChildNode(mockData, targetKey);
    expect(result).toBe(false);
  });

  it('should delete all child nodes of the target key in nested structure', () => {
    const targetKey = 'key4';
    const result = deleteAllChildNode(mockData, targetKey);
    expect(result).toBe(true);
    expect(mockData[1].sub_parameters[0].sub_parameters).toEqual([]);
  });
});

describe('updateNodeById', () => {
  // 创建测试数据
  const data = [
    {
      id: '1',
      name: 'Node 1',
      sub_parameters: [
        { id: '2', name: 'Node 2', sub_parameters: [] },
        { id: '3', name: 'Node 3', sub_parameters: [] },
      ],
    },
    { id: '4', name: 'Node 4', sub_parameters: [] },
    { id: '5', name: 'Node 5', sub_parameters: [] },
  ];
  it('should update the node data', () => {
    const targetKey = '4';
    const field = 'name';
    const value = 'Updated Node';

    // 调用被测试的函数
    updateNodeById({ data, targetKey, field, value });

    // 验证节点数据是否已更新
    expect(data[1].name).toEqual(value);
  });

  it('should update the node data in nested structure', () => {
    const targetKey = '3';
    const field = 'name';
    const value = 'Updated Node';

    // 调用被测试的函数
    updateNodeById({ data, targetKey, field, value });
    expect(data[0].sub_parameters[1].name).toEqual(value);
  });
});

describe('findTemplateNodeByPath', () => {
  it('should return the correct path', () => {
    const dsl = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    const path = ['a', 'b', 'c'];
    const result = findTemplateNodeByPath(dsl, path);
    expect(result).toEqual(path);
  });

  it('should return the correct path when the path does not exist', () => {
    const dsl = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    const path = ['a', 'b', 'd'];
    const result = findTemplateNodeByPath(dsl, path);
    expect(result).toEqual([path[0], path[1], 0]);
  });

  it('should return the correct path when the path is empty', () => {
    const dsl = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    const result = findTemplateNodeByPath(dsl, []);
    expect(result).toEqual([]);
  });
});

describe('transformTreeToObj', () => {
  it('should convert a tree to an object', () => {
    // 创建一个树结构的参数数组
    const tree = [
      {
        name: 'stringParam',
        type: 1,
        value: 'Hello, World!',
      },
      {
        name: 'numberParam',
        type: 2,
        value: 42,
      },
      {
        name: 'boolParam',
        type: 6,
        value: 'true',
      },
      {
        name: 'objectParam',
        type: 4,
        sub_parameters: [
          {
            name: 'nestedString',
            type: 1,
            value: 'Nested Value',
          },
        ],
      },
      {
        name: 'arrayParam',
        type: 5,
        sub_parameters: [
          {
            name: 'stringItem',
            type: 1,
            value: 'String in Array',
          },
          {
            name: 'numberItem',
            type: 2,
            value: 101,
          },
        ],
      },
    ];

    // 调用函数并将结果存储在变量 obj 中
    const obj = transformTreeToObj(tree);

    // 检查转换后的对象是否具有正确的属性和值
    expect(obj).toEqual({
      stringParam: 'Hello, World!',
      numberParam: 42,
      boolParam: true,
      objectParam: {
        nestedString: 'Nested Value',
      },
      arrayParam: ['String in Array', 101],
    });
  });
  it('Optional parameter', () => {
    const tree = [
      {
        name: 'boolParam',
        type: 6,
      },
      {
        name: 'objectParam',
        type: 4,
        sub_parameters: [
          {
            name: 'nestedString',
            type: 1,
          },
        ],
      },
    ];
    const obj = transformTreeToObj(tree);
    expect(obj).toEqual({});
  });
});

describe('cloneWithRandomKey', () => {
  it('should clone an object with random key', () => {
    const obj = {
      id: 'value1',
      prop2: {
        subProp1: 'subValue1',
      },
      value: [1, 2, 3],
    };

    const clone = cloneWithRandomKey(obj);

    expect(clone.id).not.toEqual(obj.id);
    expect(clone.value).toEqual(null);
    expect(clone.prop2).toEqual(obj.prop2);
  });
  it('with sub_parameters', () => {
    const obj = {
      id: 'value1',
      prop2: {
        sub_parameters: [
          {
            id: 2,
            prop2: 'props',
            value: [23],
          },
        ],
      },
      value: [1, 2, 3],
    };

    const clone = cloneWithRandomKey(obj);

    expect(clone.id).not.toEqual(obj.id);
    expect(clone.value).toEqual(null);
    expect(clone.prop2.sub_parameters.id).not.toEqual(
      obj.prop2.sub_parameters[0].id,
    );
    expect(clone.prop2.sub_parameters[0].value).toEqual(null);
    expect(clone.prop2.sub_parameters[0].prop2).toEqual(
      obj.prop2.sub_parameters[0].prop2,
    );
  });
});

describe('checkHasArray', () => {
  it('should return false when the input is not an array', () => {
    const result = checkHasArray({});
    expect(result).toBe(false);
  });

  it('should return true when the input is an array with at least one item of type Array', () => {
    const data = [
      { type: 5 },
      { type: 6, sub_parameters: [{ type: 1, value: 'string' }] },
    ];
    const result = checkHasArray(data);
    expect(result).toBe(true);
  });

  it('should return false when the input is an empty array', () => {
    const data: unknown[] = [];
    const result = checkHasArray(data);
    expect(result).toBe(false);
  });

  it('should return false when the input is an array without any items of type Array', () => {
    const data = [{ type: 6 }, { type: 1 }];
    const result = checkHasArray(data);
    expect(result).toBe(false);
  });

  it('should recusively check child arrays when an item with children is encountered', () => {
    const data = [
      { type: 6 },
      {
        type: 5,
        sub_parameters: [{ type: 6 }, { type: 5 }],
      },
    ];
    const result = checkHasArray(data);
    expect(result).toBe(true);
  });
});

describe('checkSameName', () => {
  const data = [
    {
      id: '1',
      name: 'Node 1',
      sub_parameters: [
        { id: '2', name: 'Node 2', sub_parameters: [] },
        { id: '2', name: 'Node 2', sub_parameters: [] },
        { id: '3', name: 'Node 3', sub_parameters: [] },
      ],
    },
    { id: '4', name: 'Node 4', sub_parameters: [] },
    { id: '4', name: 'Node 4', sub_parameters: [] },
    { id: '5', name: 'Node 5', sub_parameters: [] },
  ];

  it('should return true if there are multiple items with the same name', () => {
    const result = checkSameName(data, '4', 'Node 4');
    expect(result).toBe(true);
  });

  it('should return false if there are no items with the same name', () => {
    const result = checkSameName(data, '1', 'Node 1');
    expect(result).toBe(false);
  });

  it('should return undefined if the target key is not found', () => {
    const result = checkSameName(data, '6', '180');
    expect(result).toBeUndefined();
  });

  it('should work with nested data', () => {
    const result = checkSameName(data, '2', 'Node 2');
    expect(result).toBe(true);
  });
});

describe('isShowDelete', () => {
  const data = [
    {
      id: 'key1',
      sub_parameters: [
        { id: 'key2', sub_parameters: [] },
        { id: 'key4', sub_parameters: [] },
      ],
    },
    { id: 'key3', sub_parameters: [{ id: 'key5', sub_parameters: [] }] },
  ];
  it('should return true if targetKey is found in children records', () => {
    const targetKey = 'key1';
    const result = isShowDelete(data, targetKey);
    expect(result).toBe(true);
  });
  it('should return true if targetKey is found in children records', () => {
    const targetKey = 'key4';
    const result = isShowDelete(data, targetKey);
    expect(result).toBe(true);
  });
  it('should return false if targetKey is found and data has only 1 element', () => {
    const targetKey = 'key5';
    const result = isShowDelete(data, targetKey);
    expect(result).toBe(false || undefined);
  });
});

// describe('sleep', () => {
//   it('should resolve with the correct value after the specified time', async () => {
//     const timeStart = new Date().getTime();
//     const result = await sleep(1000);
//     const timeEnd = new Date().getTime();
//     expect(result).toEqual(0);
//     expect(timeEnd - timeStart >= 1000).toEqual(true);
//   });
// });
