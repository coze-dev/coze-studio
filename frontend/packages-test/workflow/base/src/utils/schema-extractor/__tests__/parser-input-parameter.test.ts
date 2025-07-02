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
    // llm 大模型节点 3
    [StandardNodeType.LLM]: [
      {
        // 对应input name
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
