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

import { useMemo } from 'react';

import { type CSpan } from '@coze-devops/common-modules/query-trace';

import { fieldHandlers } from '../utils/field-item';
import { type FieldCol, type FieldColConfig } from '../typings';

const colsConfigForTrace: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'log_id',
        options: {
          copyable: true,
          fullLine: true,
        },
      },
      {
        name: 'start_time',
      },
      {
        name: 'latency_first',
      },
    ],
  },
];

export const useTraceCols = (input: {
  span?: CSpan;
}): {
  traceCols: FieldCol[];
} => {
  const { span } = input;
  const traceCols: FieldCol[] = useMemo(() => {
    if (!span) {
      return [];
    }

    return colsConfigForTrace.map(colConfig => {
      const { fields } = colConfig;
      return {
        fields: fields?.map(fieldConfig => {
          const { name, options } = fieldConfig;
          return {
            ...fieldHandlers[name](span),
            options,
          };
        }),
      };
    });
  }, [span]);

  return {
    traceCols,
  };
};
