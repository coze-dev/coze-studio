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

import { expect, it } from 'vitest';

import { StandardNodeType } from '../../../types';
import { SchemaExtractor } from '..';

it('extract schema with default parser', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '900001',
        type: '2',
        data: {
          inputs: {
            content: {
              type: 'string',
              value: {
                type: 'literal',
                content: '{{output_a}} and {{output_b}}',
              },
            },
          },
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    // End End Node 2
    [StandardNodeType.End]: [
      {
        // Corresponding output specified content
        name: 'content',
        path: 'inputs.content.value.content',
      },
    ],
  });
  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '900001',
      nodeType: '2',
      properties: { content: '{{output_a}} and {{output_b}}' },
    },
  ]);
});
