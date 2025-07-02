import { useMemo } from 'react';

import {
  isBatchSpanType,
  type CSPanBatch,
  type CSpan,
} from '@coze-devops/common-modules/query-trace';
import { SpanType } from '@coze-arch/bot-api/ob_query_api';

import { fieldHandlers } from '../utils/field-item';
import {
  type FieldCol,
  type BatchSpanType,
  type FieldColConfig,
} from '../typings';

const colsConfigForLLMBatchCall: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'status',
      },
    ],
  },
  {
    fields: [
      {
        name: 'latency',
      },
    ],
  },
  {
    fields: [
      {
        name: 'tokens',
      },
    ],
  },
];

const colsConfigForPluginToolBatch: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'status',
      },
    ],
  },
  {
    fields: [
      {
        name: 'latency',
      },
    ],
  },
];

const colsConfigForCodeBatch: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'status',
      },
    ],
  },
  {
    fields: [
      {
        name: 'latency',
      },
    ],
  },
];

const colsConfigMap = {
  [SpanType.LLMBatchCall]: colsConfigForLLMBatchCall,
  [SpanType.WorkflowLLMBatchCall]: colsConfigForLLMBatchCall,
  [SpanType.PluginToolBatch]: colsConfigForPluginToolBatch,
  [SpanType.WorkflowPluginToolBatch]: colsConfigForPluginToolBatch,
  [SpanType.CodeBatch]: colsConfigForCodeBatch,
  [SpanType.WorkflowCodeBatch]: colsConfigForCodeBatch,
};

export const useBatchSpanCols = (input: {
  span?: CSpan;
  curBatchIndex?: number;
}): {
  batchSpanCols: FieldCol[];
} => {
  const { span, curBatchIndex } = input;
  const batchSpanCols: FieldCol[] = useMemo(() => {
    if (!span || curBatchIndex === undefined || !isBatchSpanType(span.type)) {
      return [];
    }
    const subSpan = (span as CSPanBatch).spans[curBatchIndex];
    if (!subSpan) {
      return [];
    }
    const colsConfig = colsConfigMap[subSpan.type as BatchSpanType];
    return colsConfig.map(colConfig => {
      const { fields } = colConfig;
      return {
        fields: fields?.map(fieldConfig => {
          const { name, options } = fieldConfig;
          return {
            ...fieldHandlers[name](subSpan),
            options,
          };
        }),
      };
    });
  }, [span, curBatchIndex]);

  return {
    batchSpanCols,
  };
};
