import { expect, it } from 'vitest';

import { SchemaExtractorParserName } from '../constant';
import { StandardNodeType } from '../../../types';
import { SchemaExtractor } from '..';

it('extract schema with outputs parser', () => {
  const schemaExtractor = new SchemaExtractor({
    edges: [],
    nodes: [
      {
        id: '190950',
        type: '5',
        data: {
          outputs: [
            { type: 'string', name: 'key0', description: 'test desc' },
            { type: 'string', name: 'key1' },
            { type: 'list', name: 'key2', schema: { type: 'string' } },
            {
              type: 'object',
              name: 'key3',
              schema: [{ type: 'string', name: 'key31' }],
            },
            {
              type: 'list',
              name: 'key4',
              schema: {
                type: 'object',
                schema: [
                  { type: 'boolean', name: 'key41' },
                  { type: 'integer', name: 'key42' },
                  { type: 'float', name: 'key43' },
                  { type: 'list', name: 'key44', schema: { type: 'string' } },
                  {
                    type: 'object',
                    name: 'key45',
                    schema: [{ type: 'string', name: 'key451' }],
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  });
  const extractedSchema = schemaExtractor.extract({
    // code 代码节点 5
    [StandardNodeType.Code]: [
      {
        // 对应output name
        name: 'outputs',
        path: 'outputs',
        parser: SchemaExtractorParserName.OUTPUTS,
      },
    ],
  });

  expect(extractedSchema).toStrictEqual([
    {
      nodeId: '190950',
      nodeType: '5',
      properties: {
        outputs: [
          { name: 'key0', description: 'test desc' },
          { name: 'key1' },
          { name: 'key2' },
          { name: 'key3', children: [{ name: 'key31' }] },
          {
            name: 'key4',
            children: [
              { name: 'key41' },
              { name: 'key42' },
              { name: 'key43' },
              { name: 'key44' },
              { name: 'key45', children: [{ name: 'key451' }] },
            ],
          },
        ],
      },
    },
  ]);
});
