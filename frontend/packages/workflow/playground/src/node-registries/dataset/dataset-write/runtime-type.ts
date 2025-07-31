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

const outputIO: t.Type<OutputType> = t.recursion('Output', () =>
  t.intersection([
    t.type({
      key: t.string,
      name: t.string,
      type: t.number,
    }),
    t.partial({
      children: t.array(outputIO),
    }),
  ]),
);

const outputsIO = t.array(outputIO);

const knowledge = t.union([
  t.type({
    type: t.literal('ref'),
  }),
  t.intersection([
    t.type({
      type: t.literal('ref'),
    }),
    t.partial({
      content: t.type({
        keyPath: t.array(t.string),
      }),
    }),
  ]),
  t.type({
    type: t.literal('literal'),
    content: t.string,
  }),
]);

const parsingStrategyType = t.type({
  parsingType: t.union([t.literal('fast'), t.literal('accurate')]),
  tableExtraction: t.boolean,
  imageOcr: t.boolean,
});

const chunkStrategyType = t.type({
  chunkType: t.union([
    t.literal('default'),
    t.literal('custom'),
    t.literal('level'),
  ]),
  maxLevel: t.number,
  saveTitle: t.boolean,
  overlap: t.number,
  maxToken: t.number,
  separator: t.string,
  separatorType: t.string,
});

const indexStrategyType = t.type({
  vectorModel: t.type({
    name: t.string,
  }),
  vectorIndexing: t.boolean,
  keywordIndexing: t.boolean,
  hierarchicalIndexing: t.boolean,
});

export const datasetNodeFormDataRuntimeType = t.type({
  nodeMeta: t.union([nodeMetaType, t.undefined]),
  inputs: t.type({
    datasetParameters: t.type({
      datasetParam: t.array(t.string),
      datasetSetting: t.type({
        top_k: t.union([t.number, t.undefined]),
        min_score: t.union([t.number, t.undefined]),
        strategy: t.union([t.number, t.undefined]),
      }),
    }),
    inputParameters: t.type({
      knowledge,
    }),
    datasetWriteParameters: t.union([
      t.type({
        parsingStrategy: parsingStrategyType,
        chunkStrategy: chunkStrategyType,
        indexStrategy: indexStrategyType,
      }),
      t.undefined,
    ]),
  }),
  outputs: t.array(outputIO),
});

const actualIndexStrategy = t.type({
  vectorModel: t.string,
  vectorIndexing: t.boolean,
  keywordIndexing: t.boolean,
  hierarchicalIndexing: t.boolean,
});

export const datasetNodeActualDataRuntimeType = t.type({
  nodeMeta: nodeMetaType,
  inputs: t.type({
    datasetParam: t.array(
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
    ),
    inputParameters: t.array(
      t.type({
        name: t.literal('knowledge'),
        input: knowledge,
      }),
    ),
    strategyParam: t.type({
      parsingStrategy: parsingStrategyType,
      chunkStrategy: chunkStrategyType,
      indexStrategy: actualIndexStrategy,
    }),
  }),
  outputs: outputsIO,
});
