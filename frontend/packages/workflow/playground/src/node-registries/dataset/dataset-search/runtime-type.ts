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

// eslint-disable-next-line @coze-arch/no-batch-import-or-export
import * as t from 'io-ts';

interface OutputType {
  key: string;
  name: string;
  type: number;
  children?: OutputType[];
}

const nodeMetaType = t.intersection([
  t.type({
    title: t.string,
  }),
  t.partial({
    icon: t.string,
    subtitle: t.string,
    description: t.string,
  }),
]);

const output: t.Type<OutputType> = t.recursion('output', () =>
  t.intersection([
    t.type({
      key: t.string,
      name: t.string,
      type: t.number,
    }),
    t.partial({
      children: t.array(output),
    }),
  ]),
);

const outputsType = t.array(output);

const queryType = t.union([
  t.type({
    type: t.literal('ref'),
    content: t.type({
      keyPath: t.array(t.string),
    }),
  }),
  t.type({
    type: t.literal('literal'),
    content: t.string,
  }),
]);

export const datasetNodeFormDataRuntimeType = t.type({
  nodeMeta: nodeMetaType,
  inputs: t.type({
    datasetParameters: t.type({
      datasetParam: t.array(t.string),
      datasetSetting: t.type({
        top_k: t.number,
        min_score: t.union([t.number, t.undefined]),
        strategy: t.union([t.number, t.undefined]),
        use_nl2sql: t.union([t.boolean, t.undefined]),
        use_rerank: t.boolean,
        use_rewrite: t.boolean,
        is_personal_only: t.boolean,
      }),
    }),
    inputParameters: t.type({
      queryType,
    }),
  }),
  outputs: t.array(output),
});

export const datasetNodeActualDataRuntimeType = t.type({
  nodeMeta: nodeMetaType,
  inputs: t.type({
    datasetParam: t.array(
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
        t.type({
          name: t.literal('useNl2sql'),
          input: t.type({
            type: t.literal('boolean'),
            value: t.type({
              type: t.literal('literal'),
              content: t.boolean,
            }),
          }),
        }),
        t.type({
          name: t.literal('useRerank'),
          input: t.type({
            type: t.literal('boolean'),
            value: t.type({
              type: t.literal('literal'),
              content: t.boolean,
            }),
          }),
        }),
        t.type({
          name: t.literal('useRewrite'),
          input: t.type({
            type: t.literal('boolean'),
            value: t.type({
              type: t.literal('literal'),
              content: t.boolean,
            }),
          }),
        }),
        t.type({
          name: t.literal('isPersonalOnly'),
          input: t.type({
            type: t.literal('boolean'),
            value: t.type({
              type: t.literal('literal'),
              content: t.boolean,
            }),
          }),
        }),
      ]),
    ),
    datasetSetting: t.type({
      top_k: t.number,
      min_score: t.number,
    }),
    inputParameters: t.array(
      t.type({
        name: t.literal('Query'),
        input: queryType,
      }),
    ),
  }),
  outputs: outputsType,
});
