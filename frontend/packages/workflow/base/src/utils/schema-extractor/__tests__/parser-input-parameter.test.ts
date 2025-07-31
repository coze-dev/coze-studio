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

import { SchemaExtractorParserName } from '../constant';
import { StandardNodeType } from '../../../types';
import { SchemaExtractor } from '..';

it('extract schema with inputParameters parser', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '154650',
        type: '3',
        data: {
          inputs: {
            inputParameters: [
              {
                name: 'input_a',
                input: {
                  type: 'string',
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '190950',
                      name: 'key0',
                    },
                  },
                },
              },
              {
                name: 'input_b',
                input: {
                  type: 'list',
                  schema: { type: 'string' },
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '154650',
                      name: 'batch_a',
                    },
                  },
                },
              },
              {
                name: 'const_c',
                input: {
                  type: 'string',
                  value: { type: 'literal', content: '1234' },
                },
              },
            ],
          },
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    // LLM Large Model Node 3
    [StandardNodeType.LLM]: [
      {
        // Corresponding input name
        name: 'inputs',
        path: 'inputs.inputParameters',
        parser: SchemaExtractorParserName.INPUT_PARAMETERS,
      },
    ],
  });
  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '154650',
      nodeType: '3',
      properties: {
        inputs: [
          { name: 'input_a', value: 'key0', isImage: false },
          { name: 'input_b', value: 'batch_a', isImage: false },
          { name: 'const_c', value: '1234', isImage: false },
        ],
      },
    },
  ]);
});
