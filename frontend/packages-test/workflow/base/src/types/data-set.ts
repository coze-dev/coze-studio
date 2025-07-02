// eslint-disable-next-line @coze-arch/no-batch-import-or-export
import * as t from 'io-ts';

export const datasetParams = t.array(
  t.union([
    t.type({
      name: t.literal('datasetList'),
      input: t.type({
        type: t.literal('list'),
        schema: t.type({
          type: t.literal('string'),
        }),
        value: t.type({
          type: t.literal('literal'),
          content: t.array(t.string),
        }),
      }),
    }),
    t.type({
      name: t.literal('topK'),
      input: t.type({
        type: t.literal('integer'),
        value: t.type({
          type: t.literal('literal'),
          content: t.number,
        }),
      }),
    }),
    t.type({
      name: t.literal('minScore'),
      input: t.type({
        type: t.literal('number'),
        value: t.type({
          type: t.literal('literal'),
          content: t.number,
        }),
      }),
    }),
    t.type({
      name: t.literal('strategy'),
      input: t.type({
        type: t.literal('number'),
        value: t.type({
          type: t.literal('literal'),
          content: t.number,
        }),
      }),
    }),
  ]),
);

export type DatasetParams = t.TypeOf<typeof datasetParams>;
