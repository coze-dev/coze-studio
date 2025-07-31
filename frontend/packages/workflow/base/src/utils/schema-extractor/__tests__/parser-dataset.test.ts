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

it('extract schema with dataset param parser', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '111943',
        type: '6',
        data: {
          inputs: {
            datasetParam: [
              {
                name: 'datasetList',
                input: {
                  type: 'list',
                  schema: { type: 'string' },
                  value: {
                    type: 'literal',
                    content: ['7330215302133268524', '7330215302133268524'],
                  },
                },
              },
              {
                name: 'topK',
                input: {
                  type: 'integer',
                  value: { type: 'literal', content: 6 },
                },
              },
              {
                name: 'minScore',
                input: {
                  type: 'number',
                  value: { type: 'literal', content: 0.5 },
                },
              },
              {
                name: 'strategy',
                input: {
                  type: 'integer',
                  value: { type: 'literal', content: 1 },
                },
              },
            ],
          },
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    // Knowledge Base Node 6
    [StandardNodeType.Dataset]: [
      {
        // Corresponding knowledge base name
        name: 'datasetParam',
        path: 'inputs.datasetParam',
        parser: SchemaExtractorParserName.DATASET_PARAM,
      },
    ],
  });
  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '111943',
      nodeType: '6',
      properties: {
        datasetParam: {
          datasetList: ['7330215302133268524', '7330215302133268524'],
        },
      },
    },
  ]);
});
