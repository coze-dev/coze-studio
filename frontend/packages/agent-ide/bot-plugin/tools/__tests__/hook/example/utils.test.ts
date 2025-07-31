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

import { describe, expect, it, vi } from 'vitest';
import { cloneDeep } from 'lodash-es';

import {
  resetStoreKey,
  setStoreExampleValue,
  setWorkflowExampleValue,
  typesConfig,
} from '../../../src/hooks/example/utils.ts';

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'id'),
}));

describe('resetStoreKey', () => {
  it('resets correctly', () => {
    const original = [
      {
        name: 'arr',
        desc: 'arr',
        required: false,
        type: 'array',
        sub_params: [],
      },
      {
        name: 'arrobj',
        desc: 'arrobj',
        required: false,
        type: 'array',
        sub_params: [
          {
            name: 'objkey1',
            required: false,
            description: 'objkey1',
            type: 'string',
            sub_params: [],
          },
          {
            name: 'objkey2',
            required: false,
            description: 'objkey2',
            type: 'string',
            sub_params: [],
          },
        ],
      },
      {
        name: 'obj',
        desc: 'obj',
        required: false,
        type: 'object',
        sub_params: [
          {
            type: 'string',
            sub_params: [],
            name: 'key1',
            required: false,
            description: 'key1',
          },
          {
            name: 'key2',
            required: false,
            description: 'key2',
            type: 'string',
            sub_params: [],
          },
        ],
      },
    ];

    const expected = [
      {
        name: 'arr',
        desc: 'arr',
        required: false,
        type: 5,
        sub_params: [],
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        sub_parameters: [
          {
            name: '[Array Item]',
            is_required: false,
            global_disable: false,
            local_disable: false,
            sub_type: 0,
            sub_parameters: [],
          },
        ],
      },
      {
        name: 'arrobj',
        desc: 'arrobj',
        required: false,
        type: 5,
        sub_params: [
          {
            name: 'objkey1',
            required: false,
            description: 'objkey1',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
          {
            name: 'objkey2',
            required: false,
            description: 'objkey2',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
        ],
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        sub_parameters: [
          {
            name: '[Array Item]',
            is_required: false,
            global_disable: false,
            local_disable: false,
            sub_type: 0,
            sub_parameters: [
              {
                name: 'objkey1',
                required: false,
                description: 'objkey1',
                type: 1,
                sub_params: [],
                is_required: false,
                global_disable: false,
                local_disable: false,
                id: 'id',
                sub_parameters: [],
              },
              {
                name: 'objkey2',
                required: false,
                description: 'objkey2',
                type: 1,
                sub_params: [],
                is_required: false,
                global_disable: false,
                local_disable: false,
                id: 'id',
                sub_parameters: [],
              },
            ],
          },
        ],
      },
      {
        name: 'obj',
        desc: 'obj',
        required: false,
        type: 4,
        sub_params: [
          {
            type: 1,
            sub_params: [],
            name: 'key1',
            required: false,
            description: 'key1',
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
          {
            name: 'key2',
            required: false,
            description: 'key2',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
        ],
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        sub_parameters: [
          {
            type: 1,
            sub_params: [],
            name: 'key1',
            required: false,
            description: 'key1',
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
          {
            name: 'key2',
            required: false,
            description: 'key2',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
        ],
      },
    ];

    const resetTarget = cloneDeep(original);
    resetStoreKey(resetTarget, typesConfig);

    expect(resetTarget).toEqual(expected);
  });
});

describe('setStoreExampleValue', () => {
  it('set data', () => {
    const original = [
      {
        name: 'arr',
        desc: 'arr',
        required: false,
        type: 'array',
        sub_params: [],
      },
      {
        name: 'arrobj',
        desc: 'arrobj',
        required: false,
        type: 'array',
        sub_params: [
          {
            name: 'objkey1',
            required: false,
            description: 'objkey1',
            type: 'string',
            sub_params: [],
          },
          {
            name: 'objkey2',
            required: false,
            description: 'objkey2',
            type: 'string',
            sub_params: [],
          },
        ],
      },
      {
        name: 'obj',
        desc: 'obj',
        required: false,
        type: 'object',
        sub_params: [
          {
            type: 'string',
            sub_params: [],
            name: 'key1',
            required: false,
            description: 'key1',
          },
          {
            name: 'key2',
            required: false,
            description: 'key2',
            type: 'string',
            sub_params: [],
          },
        ],
      },
    ];

    const originalExampleValue = {
      arr: ['564567'],
      arrobj: [
        {
          objkey1: '66',
          objkey2: '777',
        },
      ],
      obj: {
        key2: '456456',
      },
    };

    const expected = [
      {
        name: 'arr',
        desc: 'arr',
        required: false,
        type: 5,
        sub_params: [],
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        sub_parameters: [
          {
            name: '[Array Item]',
            is_required: false,
            global_disable: false,
            local_disable: false,
            sub_type: 0,
            sub_parameters: [],
          },
        ],
        global_default: '["564567"]',
      },
      {
        name: 'arrobj',
        desc: 'arrobj',
        required: false,
        type: 5,
        sub_params: [
          {
            name: 'objkey1',
            required: false,
            description: 'objkey1',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
          {
            name: 'objkey2',
            required: false,
            description: 'objkey2',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
        ],
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        sub_parameters: [
          {
            name: '[Array Item]',
            is_required: false,
            global_disable: false,
            local_disable: false,
            sub_type: 0,
            sub_parameters: [
              {
                name: 'objkey1',
                required: false,
                description: 'objkey1',
                type: 1,
                sub_params: [],
                is_required: false,
                global_disable: false,
                local_disable: false,
                id: 'id',
                sub_parameters: [],
              },
              {
                name: 'objkey2',
                required: false,
                description: 'objkey2',
                type: 1,
                sub_params: [],
                is_required: false,
                global_disable: false,
                local_disable: false,
                id: 'id',
                sub_parameters: [],
              },
            ],
          },
        ],
        global_default: '[{"objkey1":"66","objkey2":"777"}]',
      },
      {
        name: 'obj',
        desc: 'obj',
        required: false,
        type: 4,
        sub_params: [
          {
            type: 1,
            sub_params: [],
            name: 'key1',
            required: false,
            description: 'key1',
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
          {
            name: 'key2',
            required: false,
            description: 'key2',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
            global_default: '456456',
          },
        ],
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        sub_parameters: [
          {
            type: 1,
            sub_params: [],
            name: 'key1',
            required: false,
            description: 'key1',
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
          },
          {
            name: 'key2',
            required: false,
            description: 'key2',
            type: 1,
            sub_params: [],
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            sub_parameters: [],
            global_default: '456456',
          },
        ],
      },
    ];

    const resetTarget = cloneDeep(original);
    setStoreExampleValue(resetTarget, originalExampleValue);

    expect(resetTarget).toEqual(expected);
  });
});

describe('setWorkflowExampleValue', () => {
  it('set data', () => {
    const original = [
      {
        description: 'arr',
        name: 'arr',
        required: false,
        schema: {
          type: 'string',
        },
        type: 'list',
      },
      {
        description: 'arrobj',
        name: 'arrobj',
        required: false,
        schema: {
          schema: [
            {
              description: 'objkey1',
              name: 'objkey1',
              required: false,
              type: 'string',
            },
            {
              description: 'objkey2',
              name: 'objkey2',
              required: false,
              type: 'string',
            },
          ],
          type: 'object',
        },
        type: 'list',
      },
      {
        description: 'obj',
        name: 'obj',
        required: false,
        schema: [
          {
            description: 'key1',
            name: 'key1',
            required: false,
            type: 'string',
          },
          {
            description: 'key2',
            name: 'key2',
            required: false,
            type: 'string',
          },
        ],
        type: 'object',
      },
    ];

    const originalExampleValue = {
      arr: ['564567'],
      arrobj: [
        {
          objkey1: '66',
          objkey2: '777',
        },
      ],
      obj: {
        key2: '456456',
      },
    };

    const expected = [
      {
        description: 'arr',
        name: 'arr',
        required: false,
        schema: {
          type: 'string',
        },
        type: 5,
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        desc: 'arr',
        sub_parameters: [
          {
            name: '[Array Item]',
            is_required: false,
            type: 1,
            global_disable: false,
            local_disable: false,
            sub_type: 0,
            sub_parameters: [],
          },
        ],
        global_default: '["564567"]',
      },
      {
        description: 'arrobj',
        name: 'arrobj',
        required: false,
        schema: {
          schema: [
            {
              description: 'objkey1',
              name: 'objkey1',
              required: false,
              type: 1,
              is_required: false,
              global_disable: false,
              local_disable: false,
              id: 'id',
              desc: 'objkey1',
              sub_parameters: [],
            },
            {
              description: 'objkey2',
              name: 'objkey2',
              required: false,
              type: 1,
              is_required: false,
              global_disable: false,
              local_disable: false,
              id: 'id',
              desc: 'objkey2',
              sub_parameters: [],
            },
          ],
          type: 'object',
        },
        type: 5,
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        desc: 'arrobj',
        sub_parameters: [
          {
            name: '[Array Item]',
            is_required: false,
            type: 4,
            global_disable: false,
            local_disable: false,
            sub_type: 0,
            sub_parameters: [
              {
                description: 'objkey1',
                name: 'objkey1',
                required: false,
                type: 1,
                is_required: false,
                global_disable: false,
                local_disable: false,
                id: 'id',
                desc: 'objkey1',
                sub_parameters: [],
              },
              {
                description: 'objkey2',
                name: 'objkey2',
                required: false,
                type: 1,
                is_required: false,
                global_disable: false,
                local_disable: false,
                id: 'id',
                desc: 'objkey2',
                sub_parameters: [],
              },
            ],
          },
        ],
        global_default: '[{"objkey1":"66","objkey2":"777"}]',
      },
      {
        description: 'obj',
        name: 'obj',
        required: false,
        schema: [
          {
            description: 'key1',
            name: 'key1',
            required: false,
            type: 1,
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            desc: 'key1',
            sub_parameters: [],
          },
          {
            description: 'key2',
            name: 'key2',
            required: false,
            type: 1,
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            desc: 'key2',
            sub_parameters: [],
            global_default: '456456',
          },
        ],
        type: 4,
        is_required: false,
        global_disable: false,
        local_disable: false,
        id: 'id',
        desc: 'obj',
        sub_parameters: [
          {
            description: 'key1',
            name: 'key1',
            required: false,
            type: 1,
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            desc: 'key1',
            sub_parameters: [],
          },
          {
            description: 'key2',
            name: 'key2',
            required: false,
            type: 1,
            is_required: false,
            global_disable: false,
            local_disable: false,
            id: 'id',
            desc: 'key2',
            sub_parameters: [],
            global_default: '456456',
          },
        ],
      },
    ];

    const resetTarget = cloneDeep(original);
    setWorkflowExampleValue(resetTarget, originalExampleValue);

    expect(resetTarget).toEqual(expected);
  });
});
