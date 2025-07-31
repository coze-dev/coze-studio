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

it('extract schema with variableAssign parser', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '184010',
        type: '21',
        data: {
          inputs: {
            inputParameters: [],
            variableParameters: [],
          },
          outputs: [],
        },
        blocks: [
          {
            id: '149710',
            type: '20',
            data: {
              inputs: {
                inputParameters: [
                  {
                    left: {
                      type: 'string',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '184010',
                          name: 'var_str',
                        },
                      },
                    },
                    right: {
                      type: 'string',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '146923',
                          name: 'new_str',
                        },
                      },
                    },
                  },
                  {
                    left: {
                      type: 'float',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '184010',
                          name: 'var_num',
                        },
                      },
                    },
                    right: {
                      type: 'float',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '146923',
                          name: 'new_num',
                        },
                      },
                    },
                  },
                  {
                    left: {
                      type: 'boolean',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '184010',
                          name: 'var_bool',
                        },
                      },
                    },
                    right: {
                      type: 'boolean',
                      value: {
                        type: 'ref',
                        content: {
                          source: 'block-output',
                          blockID: '146923',
                          name: 'new_bool',
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        edges: [],
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    [StandardNodeType.SetVariable]: [
      {
        // Corresponding input name
        name: 'inputs',
        path: 'inputs.inputParameters',
        parser: SchemaExtractorParserName.VARIABLE_ASSIGN,
      },
    ],
  });
  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '149710',
      nodeType: '20',
      properties: {
        inputs: [
          { name: 'var_str', value: 'new_str' },
          { name: 'var_num', value: 'new_num' },
          { name: 'var_bool', value: 'new_bool' },
        ],
      },
    },
  ]);
});

it('variableAssign parser with empty inputParameters', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '149710',
        type: '20',
        data: {
          inputs: {
            inputParameters: undefined,
          },
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    [StandardNodeType.SetVariable]: [
      {
        // Corresponding input name
        name: 'inputs',
        path: 'inputs.inputParameters',
        parser: SchemaExtractorParserName.VARIABLE_ASSIGN,
      },
    ],
  });
  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '149710',
      nodeType: '20',
      properties: {
        inputs: [],
      },
    },
  ]);
});

it('variableAssign parser with invalid schema', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '149710',
        type: '20',
        data: {
          inputs: {
            inputParameters: [
              {}, // INVALID
              {
                left: {
                  type: 'string',
                  value: {
                    type: 'ref',
                    content: undefined, // INVALID
                  },
                },
                right: {
                  type: 'string',
                  value: {
                    type: 'ref',
                    content: 'new_str', // INVALID
                  },
                },
              },
              {
                left: {
                  type: 'boolean',
                  value: {}, // INVALID
                },
                right: {
                  type: 'boolean',
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '146923',
                      name: 'new_bool',
                    },
                  },
                },
              },
              {
                left: {
                  type: 'boolean',
                  value: {
                    type: 'ref',
                    content: {
                      source: 'block-output',
                      blockID: '184010',
                      name: 'var_bool',
                    },
                  },
                },
                right: {
                  type: 'boolean',
                  value: {}, // INVALID
                },
              },
            ],
          },
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    [StandardNodeType.SetVariable]: [
      {
        // Corresponding input name
        name: 'inputs',
        path: 'inputs.inputParameters',
        parser: SchemaExtractorParserName.VARIABLE_ASSIGN,
      },
    ],
  });
  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '149710',
      nodeType: '20',
      properties: {
        inputs: [
          {
            name: '',
            value: '',
          },
          {
            name: '',
            value: 'new_str',
          },
          {
            name: '',
            value: 'new_bool',
          },
          {
            name: 'var_bool',
            value: '',
          },
        ],
      },
    },
  ]);
});
