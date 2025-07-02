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
    // end 结束节点 2
    [StandardNodeType.End]: [
      {
        // 对应输出指定内容
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
