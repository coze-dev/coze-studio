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

import { span2CSpan } from '@coze-devops/common-modules/query-trace';
import {
  checkIsBatchBasicCSpan,
  type CSPanBatch,
  type CSpan,
  type CSpanSingle,
} from '@coze-devops/common-modules/query-trace';
import {
  type Span,
  type TraceAdvanceInfo,
} from '@coze-arch/bot-api/ob_query_api';

export const getSpanProp = (span: CSpan, key: string) => {
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

/**
 * Enhance the original Span information (inject token, status, etc. collected at the server level)
 * @param originSpans Span[]
 * @param traceAdvanceInfo TraceAdvanceInfo[]
 * @returns CSpan[]
 */
export const enhanceOriginalSpan = (
  originSpans: Span[],
  traceAdvanceInfo: TraceAdvanceInfo[],
): CSpan[] => {
  const traceAdvanceInfoMap: Record<string, TraceAdvanceInfo> =
    traceAdvanceInfo.reduce<Record<string, TraceAdvanceInfo>>((pre, cur) => {
      pre[cur.trace_id] = cur;
      return pre;
    }, {});
  const traceCSpans = originSpans.map(item => span2CSpan(item));
  const enhancedOverallSpans: CSpan[] = traceCSpans.map(item => {
    const {
      tokens: { input, output },
      status,
    } = traceAdvanceInfoMap[item.trace_id];
    return {
      ...item,
      status,
      input_tokens_sum: input,
      output_tokens_sum: output,
    };
  });
  return enhancedOverallSpans;
};
