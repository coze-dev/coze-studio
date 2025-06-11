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
    // knowledge 知识库节点 6
    [StandardNodeType.Dataset]: [
      {
        // 对应知识库名称
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
