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
