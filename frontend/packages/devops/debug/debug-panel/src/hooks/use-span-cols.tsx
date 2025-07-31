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

/* eslint-disable max-lines */
import { useMemo } from 'react';

import { type CSpan } from '@coze-devops/common-modules/query-trace';
import { SpanType } from '@coze-arch/bot-api/ob_query_api';

import { fieldHandlers } from '../utils/field-item';
import { type FieldCol, type FieldColConfig } from '../typings';

const colsConfigForStart: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'name',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'first_response_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'latency_first',
      },
      {
        name: 'tokens',
      },
    ],
  },
];

const colsConfigForInvokeAgent: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'call_type',
      },
      {
        name: 'agent_type',
      },
      {
        name: 'temperature',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'name',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'model',
      },
      {
        name: 'tokens',
      },
      {
        name: 'max_length_resp',
      },
      {
        name: 'dialog_round',
      },
    ],
  },
];

const colsConfigForSwitchAgent: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForLLMCall: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'name',
      },
      {
        name: 'call_type',
      },
      {
        name: 'max_length_resp',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'first_response_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'latency_first',
      },
      {
        name: 'model',
      },
      {
        name: 'tokens',
      },
      {
        name: 'temperature',
      },
    ],
  },
];

const colsConfigForWorkflow: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'tokens',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForWorkflowEnd: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'tokens',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForCode: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForCondition: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForPluginTool: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'call_type',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForKnowledge: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'call_type',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigGeneral: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForCard: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'call_type',
      },
      {
        name: 'status',
      },
      {
        name: 'card_id',
      },
    ],
  },
  {
    fields: [
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'latency',
      },
    ],
  },
];

const colsConfigForMessage: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'call_type',
      },
      {
        name: 'status',
      },
      {
        name: 'name',
      },
    ],
  },
  {
    fields: [
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'latency',
      },
      {
        name: 'stream_output',
      },
    ],
  },
];

const colsConfigForBWCondition: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'branch_name',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];
const colsConfigForBWConnector: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'node_type',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
    ],
  },
];

const colsConfigForHook: FieldColConfig[] = [
  {
    fields: [
      {
        name: 'category',
      },
      {
        name: 'start_time',
      },
      {
        name: 'end_time',
      },
      {
        name: 'hook_type',
      },
      {
        name: 'agent_id',
      },
      {
        name: 'is_stream',
      },
    ],
  },
  {
    fields: [
      {
        name: 'status',
      },
      {
        name: 'latency',
      },
      {
        name: 'name',
      },
      {
        name: 'hook_resp_code',
      },
      {
        name: 'hook_uri',
      },
    ],
  },
];
const colsConfigMap = {
  [SpanType.UserInput]: colsConfigForStart,
  [SpanType.ThirdParty]: colsConfigForStart,
  [SpanType.ScheduledTasks]: colsConfigForStart,
  [SpanType.OpenDialog]: colsConfigForStart,
  [SpanType.InvokeAgent]: colsConfigForInvokeAgent,
  [SpanType.RestartAgent]: colsConfigForSwitchAgent,
  [SpanType.SwitchAgent]: colsConfigForSwitchAgent,
  [SpanType.LLMCall]: colsConfigForLLMCall,
  [SpanType.WorkflowLLMCall]: colsConfigForLLMCall,
  [SpanType.LLMBatchCall]: colsConfigForLLMCall,
  [SpanType.WorkflowLLMBatchCall]: colsConfigForLLMCall,
  [SpanType.Workflow]: colsConfigForWorkflow,
  [SpanType.WorkflowStart]: colsConfigForWorkflowEnd,
  [SpanType.WorkflowEnd]: colsConfigForWorkflowEnd,
  [SpanType.PluginTool]: colsConfigForPluginTool,
  [SpanType.WorkflowPluginTool]: colsConfigForPluginTool,
  [SpanType.PluginToolBatch]: colsConfigForPluginTool,
  [SpanType.WorkflowPluginToolBatch]: colsConfigForPluginTool,
  [SpanType.Knowledge]: colsConfigForKnowledge,
  [SpanType.WorkflowKnowledge]: colsConfigForKnowledge,
  [SpanType.Code]: colsConfigForCode,
  [SpanType.WorkflowCode]: colsConfigForCode,
  [SpanType.CodeBatch]: colsConfigForCode,
  [SpanType.WorkflowCodeBatch]: colsConfigForCode,
  [SpanType.Condition]: colsConfigForCondition,
  [SpanType.WorkflowCondition]: colsConfigForCondition,
  [SpanType.Unknown]: colsConfigGeneral,
  [SpanType.Chain]: [],
  [SpanType.Card]: colsConfigForCard,
  [SpanType.WorkflowMessage]: colsConfigForMessage,
  [SpanType.Hook]: colsConfigForHook,
  [SpanType.BWStart]: colsConfigGeneral,
  [SpanType.BWEnd]: colsConfigGeneral,
  [SpanType.BWBatch]: colsConfigGeneral,
  [SpanType.BWLoop]: colsConfigGeneral,
  [SpanType.BWCondition]: colsConfigForBWCondition,
  [SpanType.BWLLM]: colsConfigForLLMCall,
  [SpanType.BWParallel]: colsConfigGeneral,
  [SpanType.BWScript]: colsConfigGeneral,
  [SpanType.BWVariable]: colsConfigGeneral,
  [SpanType.BWCallFlow]: colsConfigGeneral,
  [SpanType.BWConnector]: colsConfigForBWConnector,
};

export const useSpanCols = (input: {
  span?: CSpan;
}): {
  spanCols: FieldCol[];
} => {
  const { span } = input;
  const spanCols: FieldCol[] = useMemo(() => {
    if (!span) {
      return [];
    }
    const colsConfig = colsConfigMap[span.type];
    return (
      colsConfig?.map(colConfig => {
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
      }) || []
    );
  }, [span]);

  return {
    spanCols,
  };
};
