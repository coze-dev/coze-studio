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
