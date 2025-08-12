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

import {
  SpanCategory,
  SpanStatus,
  SpanType,
} from '@coze-arch/bot-api/ob_query_api';

import {
  type CTrace,
  type CSPanBatch,
  type CSpan,
  type CSpanSingle,
} from '../typings/cspan';
import { virtualStartSpanId } from '../constant';

export const getSpanProp = (span: CSpan | CTrace, key: string) => {
  if (checkIsBatchBasicCSpan(span)) {
    const batchSpan = span as CSPanBatch;
    return (
      batchSpan[key as keyof CSPanBatch] ??
      batchSpan.spans[0]?.extra?.[key as keyof CSPanBatch['spans'][0]['extra']]
    );
  } else {
    const singleSpan = span as CSpanSingle;
    return (
      singleSpan[key as keyof CSpanSingle] ??
      singleSpan.extra?.[key as keyof CSpanSingle['extra']]
    );
  }
};

export const getTokens = (
  span: CSpan,
): {
  input_tokens?: number;
  output_tokens?: number;
} => {
  if ('spans' in span) {
    const spanBatch = span as CSPanBatch;
    let inputTokensSum = 0;
    let outputTokensSum = 0;
    spanBatch.spans.forEach(subSpan => {
      const inputTokens = subSpan?.extra?.input_tokens ?? 0;
      const outputTokens = subSpan?.extra?.output_tokens ?? 0;
      inputTokensSum += inputTokens;
      outputTokensSum += outputTokens;
    });
    return {
      input_tokens: inputTokensSum,
      output_tokens: outputTokensSum,
    };
  } else if (
    span.type === SpanType.UserInput ||
    span.type === SpanType.UserInputV2 ||
    span.type === SpanType.Workflow
  ) {
    // SingleSpan Node - Workflow
    const inputTokens = getSpanProp(span, 'input_tokens_sum') as number;
    const outputTokens = getSpanProp(span, 'output_tokens_sum') as number;

    return {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    };
  } else {
    // SingleSpan Node - Non-workflow Node
    const inputTokens = getSpanProp(span, 'input_tokens') as number;
    const outputTokens = getSpanProp(span, 'output_tokens') as number;

    return {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    };
  }
};

export const isBatchSpanType = (type: SpanType): boolean => {
  const whites = [
    SpanType.LLMBatchCall,
    SpanType.WorkflowLLMBatchCall,
    SpanType.PluginToolBatch,
    SpanType.WorkflowPluginToolBatch,
    SpanType.CodeBatch,
    SpanType.WorkflowCodeBatch,
  ];
  return whites.includes(type);
};

export const checkIsBatchBasicCSpan = (span: CSpan | CTrace) => 'spans' in span;

export const isVisibleSpan = (span: CSpan) => {
  const whites = [
    SpanType.Unknown,
    SpanType.UserInput,
    SpanType.UserInputV2,
    SpanType.ThirdParty,
    SpanType.ScheduledTasks,
    SpanType.OpenDialog,
    SpanType.InvokeAgent,
    SpanType.RestartAgent,
    SpanType.SwitchAgent,
    SpanType.LLMCall,
    SpanType.WorkflowLLMCall,
    SpanType.LLMBatchCall,
    SpanType.WorkflowLLMBatchCall,
    SpanType.Workflow,
    SpanType.WorkflowStart,
    SpanType.WorkflowEnd,
    SpanType.PluginTool,
    SpanType.WorkflowPluginTool,
    SpanType.PluginToolBatch,
    SpanType.WorkflowPluginToolBatch,
    SpanType.Knowledge,
    SpanType.WorkflowKnowledge,
    SpanType.Code,
    SpanType.WorkflowCode,
    SpanType.CodeBatch,
    SpanType.WorkflowCodeBatch,
    SpanType.Condition,
    SpanType.WorkflowCondition,
    SpanType.Card,
    SpanType.WorkflowMessage,
    SpanType.Hook,
    SpanType.BWStart,
    SpanType.BWEnd,
    SpanType.BWBatch,
    SpanType.BWLoop,
    SpanType.BWCondition,
    SpanType.BWLLM,
    SpanType.BWParallel,
    SpanType.BWScript,
    SpanType.BWVariable,
    SpanType.BWCallFlow,
    SpanType.BWConnector,
  ];

  return whites.includes(span.type);
};

export const genVirtualStart = (spans: CSpan[]): CSpan => {
  let startAt = Number.POSITIVE_INFINITY;
  let endAt = Number.NEGATIVE_INFINITY;
  spans.forEach(span => {
    startAt = Math.min(startAt, span.start_time);
    endAt = Math.max(endAt, span.start_time + span.latency);
  });
  if (
    startAt === Number.POSITIVE_INFINITY ||
    endAt === Number.NEGATIVE_INFINITY
  ) {
    startAt = 0;
    endAt = 0;
  }
  return {
    id: virtualStartSpanId,
    parent_id: '',
    trace_id: '',
    name: '',
    type: SpanType.UserInput,
    category: SpanCategory.Start,
    status: SpanStatus.Unknown,
    start_time: startAt,
    latency: endAt - startAt,
  };
};
