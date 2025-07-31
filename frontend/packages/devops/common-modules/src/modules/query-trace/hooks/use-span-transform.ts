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

import {
  SpanType,
  type Span,
  type TraceAdvanceInfo,
  SpanStatus,
  SpanCategory,
} from '@coze-arch/bot-api/ob_query_api';

import { spans2CSpans } from '../utils/cspan-transform';
import {
  type SpanNode,
  buildCallTrees,
  getRootSpan,
} from '../utils/cspan-graph';
import { genVirtualStart, getSpanProp } from '../utils/cspan';
import {
  type SpanCategoryMeta,
  type CSpan,
  type CSpanAttrInvokeAgent,
  type CSPanBatch,
  type CTrace,
  type CSpanAttrUserInput,
} from '../typings/cspan';

// Append traceAdvanceInfo to the root node
const appendTraceAdvanceInfo = (
  spans: CSpan[],
  traceAdvanceInfo?: Omit<TraceAdvanceInfo, 'trace_id'>,
): CSpan[] =>
  spans.map(span => {
    // Modify the state of the root node. The tokens and status of the root node are subject to the server level
    if (
      span.type === SpanType.UserInput ||
      span.type === SpanType.UserInputV2
    ) {
      const span0 = span as CSpanAttrUserInput;
      return {
        ...span0,
        status: traceAdvanceInfo?.status ?? SpanStatus.Unknown,
        input_tokens_sum: traceAdvanceInfo?.tokens.input,
        output_tokens_sum: traceAdvanceInfo?.tokens.output,
      };
    } else {
      return span;
    }
  });

interface TokensSum {
  input_tokens_sum: number;
  output_tokens_sum: number;
}
const appendSpans = (spans: CSpan[], callTrees: SpanNode[]) => {
  const tokensMap: {
    [spanId: string]: TokensSum | undefined;
  } = {};
  const calculateTokensSum = (span: SpanNode): TokensSum => {
    const { input_tokens: inputTokens, output_tokens: outputTokens } =
      getCSpanTokens(span);
    let inputTokensSumRst = inputTokens;
    let outputTokensSumRst = outputTokens;

    span.children?.forEach((subSpan: SpanNode) => {
      const subTokensSum = calculateTokensSum(subSpan);
      inputTokensSumRst += subTokensSum.input_tokens_sum;
      outputTokensSumRst += subTokensSum.output_tokens_sum;
      return span;
    });
    const tokensSum = {
      input_tokens_sum: inputTokensSumRst,
      output_tokens_sum: outputTokensSumRst,
    };
    tokensMap[span.id] = tokensSum;
    return tokensSum;
  };

  callTrees.forEach(callTree => {
    calculateTokensSum(callTree);
  });

  return spans.map(span => {
    if (
      span.type === SpanType.UserInput ||
      span.type === SpanType.UserInputV2
    ) {
      // The values input_tokens_sum and output_tokens_sum of the root node are subject to server level acquisition and are not calculated
      return span;
    } else {
      return {
        ...span,
        input_tokens_sum: tokensMap[span.id]?.input_tokens_sum,
        output_tokens_sum: tokensMap[span.id]?.output_tokens_sum,
      };
    }
  });
};

// Get the tokens information of the CSpan node
const getCSpanTokens = (
  span: CSpan,
): {
  input_tokens: number;
  output_tokens: number;
} => {
  if ('spans' in span) {
    const spanBatch = span as CSPanBatch;
    let inputTokensRst = 0;
    let outputTokensRst = 0;
    spanBatch.spans.forEach(subSpan => {
      const inputTokens = subSpan?.extra?.input_tokens;
      const outputTokens = subSpan?.extra?.output_tokens;
      if (inputTokens !== undefined) {
        inputTokensRst += inputTokens;
      }
      if (outputTokens !== undefined) {
        outputTokensRst += outputTokens;
      }
    });
    return {
      input_tokens: inputTokensRst,
      output_tokens: outputTokensRst,
    };
  } else {
    // SingleSpan Node
    return {
      input_tokens: (getSpanProp(span, 'input_tokens') as number) ?? 0,
      output_tokens: (getSpanProp(span, 'output_tokens') as number) ?? 0,
    };
  }
};

// Append invokeAgentInfo's dialog_round and model fields
const appendRootSpan = (info: { rootSpan: CSpan; spans: CSpan[] }): CTrace => {
  const { rootSpan, spans } = info;
  const rstSpan: CTrace = rootSpan;
  let { extra } = rstSpan;

  const invokeAgentSpans = spans.filter(
    span => span.type === SpanType.InvokeAgent,
  );
  if (invokeAgentSpans.length > 0) {
    const invokeAgentSpan = invokeAgentSpans[0] as CSpanAttrInvokeAgent;
    extra = {
      ...extra,
      dialog_round: invokeAgentSpan.extra?.dialog_round,
      model: invokeAgentSpan.extra?.model,
    };
  }

  return {
    ...rstSpan,
    extra,
  };
};

interface UseSpanTransformProps {
  orgSpans: Span[];
  traceAdvanceInfo?: Omit<TraceAdvanceInfo, 'trace_id'>;
  spanCategoryMeta?: SpanCategoryMeta;
  messageId?: string;
}
interface UseSpanTransformReturn {
  rootSpan: CTrace;
  spans: CSpan[];
}

// When the start node does not exist, generate a virtual start node
export const appendVirtualStart = (spans: CSpan[]): CSpan[] => {
  const startSpans = spans.filter(rootSpan => {
    const { category } = rootSpan;
    return category === SpanCategory.Start;
  });

  // Generate virtual spans
  if (startSpans.length > 0) {
    return spans;
  } else {
    const virtualStartSpan = genVirtualStart(spans);
    return spans.concat(virtualStartSpan);
  }
};

export const useSpanTransform = (
  props: UseSpanTransformProps,
): UseSpanTransformReturn => {
  const { orgSpans, traceAdvanceInfo, spanCategoryMeta, messageId } = props;

  const rst = useMemo(() => {
    let spans = spans2CSpans(orgSpans, spanCategoryMeta);
    // Append virtual span
    spans = appendVirtualStart(spans);

    // append traceAdvanceInfo
    spans = appendTraceAdvanceInfo(spans, traceAdvanceInfo);

    // According to spans, assembling called trees
    let callTrees = buildCallTrees(spans);
    // If there is more than 1 root node, it needs to be filtered by message id.
    if (callTrees.length > 1 && messageId) {
      callTrees = callTrees.filter(
        root =>
          !('extra' in root) ||
          (root.extra && !('message_id' in root.extra)) ||
          // In the presence of message_id, filter the nodes with matching IDs
          root.extra?.message_id === messageId,
      );
    }
    const rootSpan = getRootSpan(callTrees, false);

    // Root node adjustment of rootSpan: add invokeAgent information
    const rootSpanRst = appendRootSpan({
      rootSpan,
      spans,
    });

    const visit = (targetId: string, root: SpanNode): boolean => {
      if (root.id === targetId) {
        return true;
      }
      return root.children?.some(subRoot => visit(targetId, subRoot)) ?? false;
    };

    // Filter out nodes not in rootSpan
    spans = spans.filter(span => visit(span.id, rootSpan));

    // Adjust the spans node: the accumulation calculation of tokens in the workflow node in spans
    const spansRst = appendSpans(spans, callTrees);
    return {
      rootSpan: rootSpanRst,
      spans: spansRst,
    };
  }, [orgSpans, traceAdvanceInfo, spanCategoryMeta, messageId]);

  return rst;
};
