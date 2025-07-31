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

import { convertInputs } from './convert-inputs';

describe('convert-inputs', () => {
  it('select variable without name', () => {
    expect(
      convertInputs([
        {
          name: 'output',
          input: undefined,
        } as any,
      ]),
    ).toEqual([
      {
        name: 'output',
        keyPath: [],
      },
    ]);
  });

  it('select variable', () => {
    expect(
      convertInputs([
        {
          name: 'output',
          input: {
            type: 'ref',
            content: {
              keyPath: ['196209', 'output'],
            },
            rawMeta: {
              type: 1,
            },
          },
        } as any,
      ]),
    ).toEqual([
      {
        name: 'output',
        keyPath: ['196209', 'output'],
      },
    ]);
  });

  it('select variable child', () => {
    expect(
      convertInputs([
        {
          name: 'output',
          input: {
            type: 'ref',
            content: {
              keyPath: ['100001', 'obj', 'a'],
            },
            rawMeta: {
              type: 1,
            },
          },
        },
      ] as any),
    ).toEqual([
      {
        name: 'output',
        keyPath: ['100001', 'obj', 'a'],
      },
    ]);
  });
});
