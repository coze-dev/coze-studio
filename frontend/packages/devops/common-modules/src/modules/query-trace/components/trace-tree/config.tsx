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

import { type ReactNode } from 'react';

import {
  IconSpanAgent,
  IconSpanCard,
  IconSpanCode,
  IconSpanCondition,
  IconSpanKnowledge,
  IconSpanVar,
  IconSpanLLMCall,
  IconSpanHook,
  IconSpanMessage,
  IconSpanPluginTool,
  IconSpanUnknown,
  IconSpanWorkflow,
  IconSpanWorkflowEnd,
  IconSpanWorkflowStart,
  IconSpanBMConnector,
  IconSpanBMParallel,
  IconSpanBMBatch,
} from '@coze-arch/bot-icons';
import { SpanStatus, SpanCategory } from '@coze-arch/bot-api/ob_query_api';

import { type LineStyle } from '../tree';
import { type TraceTreeProps } from './typing';

type DefaultProps = Pick<TraceTreeProps, 'lineStyle' | 'globalStyle'>;

export const defaultProps: DefaultProps = {
  lineStyle: {
    normal: {
      stroke: '#C6C6CD',
      strokeWidth: 1,
    },
    hover: {
      stroke: '#C6C6CD',
      strokeWidth: 2,
    },
    select: {
      stroke: '#C6C6CD',
      strokeWidth: 2,
    },
  },
};

type SpanCategoryConfig = Record<
  number,
  | {
      icon: ReactNode;
      title: string;
    }
  | undefined
>;

export const spanCategoryConfig: SpanCategoryConfig = {
  [SpanCategory.Unknown]: {
    icon: <IconSpanUnknown />,
    title: 'Unknown',
  },
  [SpanCategory.Start]: {
    icon: <IconSpanWorkflowStart />,
    title: 'Start',
  },
  [SpanCategory.Agent]: {
    icon: <IconSpanAgent />,
    title: 'Agent',
  },
  [SpanCategory.LLMCall]: {
    icon: <IconSpanLLMCall />,
    title: 'Invoke LLM',
  },
  [SpanCategory.Workflow]: {
    icon: <IconSpanWorkflow />,
    title: 'Invoke Workflow',
  },

  [SpanCategory.WorkflowStart]: {
    icon: <IconSpanWorkflowStart />,
    title: 'Workflow Start',
  },
  [SpanCategory.WorkflowEnd]: {
    icon: <IconSpanWorkflowEnd />,
    title: 'Workflow End',
  },

  [SpanCategory.Plugin]: {
    icon: <IconSpanPluginTool />,
    title: 'Invoke Plugin',
  },

  [SpanCategory.Knowledge]: {
    icon: <IconSpanKnowledge />,
    title: 'Recall Knowledage',
  },

  [SpanCategory.Code]: {
    icon: <IconSpanCode />,
    title: 'Execute Code',
  },
  [SpanCategory.Condition]: {
    icon: <IconSpanCondition />,
    title: 'If Condition',
  },
  [SpanCategory.Card]: {
    icon: <IconSpanCard />,
    title: 'Card',
  },
  [SpanCategory.Message]: {
    icon: <IconSpanMessage />,
    title: 'Message',
  },
  [SpanCategory.Variable]: {
    icon: <IconSpanVar />,
    title: 'Variable',
  },
  [SpanCategory.Hook]: {
    icon: <IconSpanHook />,
    title: 'Hook',
  },
  [SpanCategory.Batch]: {
    icon: <IconSpanBMBatch />,
    title: 'Batch',
  },
  [SpanCategory.Loop]: {
    icon: <IconSpanBMBatch />,
    title: 'Loop',
  },
  [SpanCategory.Parallel]: {
    icon: <IconSpanBMParallel />,
    title: 'Parallel',
  },
  [SpanCategory.Script]: {
    icon: <IconSpanCode />,
    title: 'Script',
  },
  [SpanCategory.CallFlow]: {
    icon: <IconSpanWorkflow />,
    title: 'CallFlow',
  },
  [SpanCategory.Connector]: {
    icon: <IconSpanBMConnector />,
    title: 'Connector',
  },
};

interface SpanStatusConfig {
  [spanStatus: string]: {
    lineStyle?: LineStyle;
  };
}

export const spanStatusConfig: SpanStatusConfig = {
  [SpanStatus.Success]: {},
  [SpanStatus.Error]: {
    lineStyle: {
      normal: {
        stroke: '#FF441E',
      },
      hover: {
        stroke: '#FF441E',
      },
      select: {
        stroke: '#FF441E',
      },
    },
  },
  [SpanStatus.Broken]: {},
  [SpanStatus.Unknown]: {},
};
