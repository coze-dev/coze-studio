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

/* eslint-disable @typescript-eslint/naming-convention */
import { type ViewVariableTreeNode } from '@coze-workflow/base';

import { jsonFormat, metasToJSON, niceAssign } from './';

const ViewVariableType = {
  String: 1,
  Integer: 2,
  Boolean: 3,
  Number: 4,
  Object: 6,
  ArrayString: 99,
  ArrayInteger: 100,
  ArrayBoolean: 101,
  ArrayNumber: 102,
  ArrayObject: 103,
};
vi.mock('@coze-workflow/base', () => ({
  ViewVariableType: {
    String: 1,
    Integer: 2,
    Boolean: 3,
    Number: 4,
    Object: 6,
    ArrayString: 99,
    ArrayInteger: 100,
    ArrayBoolean: 101,
    ArrayNumber: 102,
    ArrayObject: 103,
  },
}));

describe('mock-set-utils-getPluginInfo', () => {
  it('jsonFormat', () => {
    expect(jsonFormat(undefined)).toBeUndefined();
    expect(jsonFormat(BigInt(1))).toEqual(BigInt(1));
    expect(jsonFormat({ a: 1, b: { c: 2 } })).toEqual(
      '{\n    "a": 1,\n    "b": {\n        "c": 2\n    }\n}',
    );
  });

  it('metasToJSON illegal input', () => {
    expect(metasToJSON(undefined)).toEqual({});
  });

  it('niceAssign illegal input', () => {
    expect(niceAssign('1+1')).toEqual('1+1');
    expect(niceAssign()).toBeUndefined();
    expect(niceAssign(JSON.stringify({}), [], [])).toEqual(jsonFormat({}));
  });
  it('niceAssign generate default', () => {
    const metas = [
      {
        key: 'String',
        name: 'String',
        type: ViewVariableType.String,
      },
      {
        key: 'Integer',
        name: 'Integer',
        type: ViewVariableType.Integer,
      },
      {
        key: 'Boolean',
        name: 'Boolean',
        type: ViewVariableType.Boolean,
      },
      {
        key: 'Number',
        name: 'Number',
        type: ViewVariableType.Number,
      },
      {
        key: 'Object',
        name: 'Object',
        type: ViewVariableType.Object,
        children: [
          {
            key: 'Object-1',
            name: 'Object-1',
            type: ViewVariableType.String,
          },
        ],
      },
      {
        key: 'ArrayString',
        name: 'ArrayString',
        type: ViewVariableType.ArrayString,
      },
      {
        key: 'ArrayInteger',
        name: 'ArrayInteger',
        type: ViewVariableType.ArrayInteger,
      },
      {
        key: 'ArrayBoolean',
        name: 'ArrayBoolean',
        type: ViewVariableType.ArrayBoolean,
      },
      {
        key: 'ArrayNumber',
        name: 'ArrayNumber',
        type: ViewVariableType.ArrayNumber,
      },
      {
        key: 'ArrayObject',
        name: 'ArrayObject',
        type: ViewVariableType.ArrayObject,
        children: [
          {
            key: 'ArrayObject-1',
            name: 'ArrayObject-1',
            type: ViewVariableType.String,
          },
        ],
      },
    ];

    expect(metasToJSON(metas as unknown as ViewVariableTreeNode[])).toEqual({
      String: '',
      Integer: 0,
      Boolean: false,
      Number: 0,
      Object: {
        'Object-1': '',
      },
      ArrayString: [],
      ArrayInteger: [],
      ArrayBoolean: [],
      ArrayNumber: [],
      ArrayObject: [
        {
          'ArrayObject-1': '',
        },
      ],
    });
  });

  [
    {
      title: '(type changed) niceAssign: String -> Integer',
      from: ViewVariableType.String,
      to: ViewVariableType.Integer,
      inputJson: {
        key: '',
      },
      expectJson: {
        key: 0,
      },
    },
    {
      title: '(type changed) niceAssign: String -> ArrayBoolean',
      from: ViewVariableType.String,
      to: ViewVariableType.ArrayBoolean,
      inputJson: {
        key: '',
      },
      expectJson: {
        key: [],
      },
    },
    {
      title: '(type changed) niceAssign: Boolean -> Number',
      from: ViewVariableType.Boolean,
      to: ViewVariableType.Number,
      inputJson: {
        key: true,
      },
      expectJson: {
        key: 0,
      },
    },
    {
      title: '(type changed) niceAssign: Number -> ArrayObject',
      from: ViewVariableType.Number,
      to: ViewVariableType.ArrayObject,
      inputJson: {
        key: 0,
      },
      expectJson: {
        key: [{}],
      },
    },
    {
      title: '(type changed) niceAssign: Object -> ArrayObject',
      from: ViewVariableType.Object,
      to: ViewVariableType.ArrayObject,
      inputJson: {
        key: {
          key1: '1',
          key2: 1,
          key3: {},
        },
      },
      expectJson: {
        key: [
          {
            key1: '1',
            key2: 1,
            key3: {},
          },
        ],
      },
    },
    {
      title: '(type changed) niceAssign: ArrayObject -> Object',
      from: ViewVariableType.ArrayObject,
      to: ViewVariableType.Object,
      inputJson: {
        key: [
          {
            key1: '1',
            key2: 1,
            key3: {},
          },
          {
            key1: '2',
            key2: 2,
            key3: {},
          },
        ],
      },
      expectJson: {
        key: {
          key1: '1',
          key2: 1,
          key3: {},
        },
      },
    },
    {
      title: '(type changed) niceAssign: ArrayObject -> Object with autoFix',
      from: ViewVariableType.ArrayObject,
      to: ViewVariableType.Object,
      inputJson: {
        key: [],
      },
      expectJson: {
        key: {},
      },
    },
    {
      title: '(type changed) niceAssign: more string refs',
      from: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: 'key-id-1',
              name: 'key1',
              type: ViewVariableType.String,
            },
          ],
        },
      ],
      to: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: 'key-id-1',
              name: 'key1',
              type: ViewVariableType.Number,
            },
          ],
        },
      ],
      inputJson: {
        key: [
          {
            key1: '1',
          },
          {
            key1: '2',
          },
        ],
      },
      expectJson: {
        key: [
          {
            key1: 0,
          },
          {
            key1: 0,
          },
        ],
      },
    },
    {
      title: '(name changed) niceAssign: more string refs',
      from: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: 'key-id-1',
              name: 'key1',
              type: ViewVariableType.String,
            },
          ],
        },
      ],
      to: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: 'key-id-1',
              name: 'key1-changed',
              type: ViewVariableType.String,
            },
          ],
        },
      ],
      inputJson: {
        key: [
          {
            key1: '1',
          },
          {
            key1: '2',
          },
        ],
      },
      expectJson: {
        key: [
          {
            'key1-changed': '1',
          },
          {
            'key1-changed': '2',
          },
        ],
      },
    },

    {
      title: '(name changed) niceAssign: more refs with arrayObject autoFix ',
      from: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: 'key-id-1',
              name: 'key1',
              type: ViewVariableType.String,
            },
          ],
        },
      ],
      to: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: 'key-id-1',
              name: 'key1-changed',
              type: ViewVariableType.String,
            },
          ],
        },
      ],
      inputJson: {},
      expectJson: {
        key: [
          {
            'key1-changed': '',
          },
        ],
      },
    },

    {
      title: '(name changed) niceAssign: more refs with object autofix ',
      from: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.Object,
          children: [
            {
              key: 'key-id-1',
              name: 'key1',
              type: ViewVariableType.Object,
            },
          ],
        },
      ],
      to: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.Object,
          children: [
            {
              key: 'key-id-1',
              name: 'key1-changed',
              type: ViewVariableType.Object,
            },
          ],
        },
      ],
      inputJson: {},
      expectJson: {
        key: {
          'key1-changed': {},
        },
      },
    },

    {
      title: '(removed) niceAssign: more string refs',
      from: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: 'key-id-1',
              name: 'key1',
              type: ViewVariableType.String,
            },
          ],
        },
      ],
      to: [
        {
          key: 'key-id',
          name: 'key',
          type: ViewVariableType.ArrayObject,
          children: [],
        },
      ],
      inputJson: {
        key: [
          {
            key1: '1',
          },
          {
            key1: '2',
          },
        ],
      },
      expectJson: {
        key: [{}, {}],
      },
    },
  ].forEach(d => {
    it(d.title, () => {
      const oldMetas =
        typeof d.from === 'object'
          ? d.from
          : [
              {
                key: 'key-id',
                name: 'key',
                type: d.from,
              },
            ];

      const newMetas =
        typeof d.to === 'object'
          ? d.to
          : [
              {
                key: 'key-id',
                name: 'key',
                type: d.to,
              },
            ];

      expect(
        niceAssign(JSON.stringify(d.inputJson), newMetas, oldMetas),
      ).toEqual(jsonFormat(d.expectJson));
    });
  });
});
